// app/actions/invoices.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { calculateLast12MonthsRevenueNOK } from '@/app/actions/mva'
import type { SupabaseClient } from '@supabase/supabase-js'

type DbClient = SupabaseClient

const FALLBACK_RATES: Record<string, number> = {
  NOK: 1,
  PLN: 0.42,
  EUR: 11.5,
  USD: 10.5,
}

interface LineItemInput {
  description: string
  quantity: number
  unit_price: number
  amount: number
}

async function getUserPrefix(supabase: DbClient, userId: string): Promise<string> {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('invoice_prefix')
    .eq('user_id', userId)
    .single()

  if (!profile?.invoice_prefix) {
    throw new Error(
      'Please set your invoice prefix in Settings before creating invoices'
    )
  }

  return profile.invoice_prefix
}

async function generateInvoiceNumber(
  supabase: DbClient,
  userId: string
): Promise<string> {
  const prefix = await getUserPrefix(supabase, userId)

  const { data: invoices } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!invoices || invoices.length === 0) {
    return `${prefix}-001`
  }

  const numbers = invoices
    .map((inv: { invoice_number: string }) => {
      const match = inv.invoice_number.match(new RegExp(`${prefix}-(\\d+)`))
      return match ? parseInt(match[1]) : 0
    })
    .filter((num: number) => num > 0)

  if (numbers.length === 0) {
    return `${prefix}-001`
  }

  const maxNumber = Math.max(...numbers)
  const nextNumber = maxNumber + 1

  return `${prefix}-${nextNumber.toString().padStart(3, '0')}`
}

async function isInvoiceNumberUnique(
  supabase: DbClient,
  userId: string,
  invoiceNumber: string,
  excludeInvoiceId?: string
): Promise<boolean> {
  let query = supabase
    .from('invoices')
    .select('id')
    .eq('user_id', userId)
    .eq('invoice_number', invoiceNumber)

  if (excludeInvoiceId) {
    query = query.neq('id', excludeInvoiceId)
  }

  const { data } = await query

  return !data || data.length === 0
}

async function calculateInvoiceVAT(
  supabase: DbClient,
  userId: string,
  clientCountry: string,
  invoiceAmountNOK: number
): Promise<{
  vatRate: number
  notice: string
  alertUser: boolean
  mvaRegistered: boolean
}> {
  // ALWAYS get current MVA registration status from settings
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('mva_registered')
    .eq('user_id', userId)
    .single()

  const mvaRegistered = profile?.mva_registered || false

  // Calculate current revenue in NOK (last 12 months)
  const currentRevenueNOK = await calculateLast12MonthsRevenueNOK()
  const totalAfterThisInvoice = currentRevenueNOK + invoiceAmountNOK

  const NORWEGIAN_VAT_RATE = 25
  const MVA_THRESHOLD = 50000

  // DECISION TREE
  if (mvaRegistered) {
    // USER IS REGISTERED - always charge VAT to Norwegian clients
    if (clientCountry === 'NO') {
      return {
        vatRate: NORWEGIAN_VAT_RATE,
        notice: 'registered_norwegian_client',
        alertUser: false,
        mvaRegistered: true,
      }
    } else {
      // Export - 0% VAT
      return {
        vatRate: 0,
        notice: 'export_zero_rated',
        alertUser: false,
        mvaRegistered: true,
      }
    }
  } else {
    // USER IS NOT REGISTERED
    if (totalAfterThisInvoice > MVA_THRESHOLD) {
      // CROSSING THRESHOLD - charge VAT and alert
      return {
        vatRate: NORWEGIAN_VAT_RATE,
        notice: 'threshold_crossed',
        alertUser: true,
        mvaRegistered: false,
      }
    } else {
      // Under threshold - no VAT
      return {
        vatRate: 0,
        notice: 'under_threshold',
        alertUser: false,
        mvaRegistered: false,
      }
    }
  }
}

export async function createInvoice(formData: FormData) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let clientId = formData.get('client_id') as string | null

  // Check if creating a new client
  const newClientName = formData.get('new_client_name') as string | null

  if (newClientName) {
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        user_id: user.id,
        name: newClientName,
        org_number: formData.get('new_client_org_number') as string,
        address: formData.get('new_client_address') as string,
        country: (formData.get('new_client_country') as string) || 'NO',
      })
      .select()
      .single()

    if (clientError) {
      redirect(
        '/dashboard/invoices/new?error=' +
          encodeURIComponent(clientError.message)
      )
    }

    clientId = newClient.id
  }

  if (!clientId) {
    redirect('/dashboard/invoices/new?error=Please select or create a client')
  }

  // Get client to check country
  const { data: client } = await supabase
    .from('clients')
    .select('country')
    .eq('id', clientId)
    .single()

  const clientCountry = client?.country || 'NO'

  // Get user's prefix
  let prefix: string
  try {
    prefix = await getUserPrefix(supabase, user.id)
  } catch (error: any) {
    redirect(
      '/dashboard/invoices/new?error=' + encodeURIComponent(error.message)
    )
    return
  }

  // Handle invoice number
  let invoiceNumber = (formData.get('invoice_number') as string)?.trim()

  if (!invoiceNumber || invoiceNumber === '') {
    invoiceNumber = await generateInvoiceNumber(supabase, user.id)

    while (!(await isInvoiceNumberUnique(supabase, user.id, invoiceNumber))) {
      const match = invoiceNumber.match(new RegExp(`${prefix}-(\\d+)`))
      if (match) {
        const num = parseInt(match[1]) + 1
        invoiceNumber = `${prefix}-${num.toString().padStart(3, '0')}`
      } else {
        invoiceNumber = `${prefix}-001`
      }
    }
  } else {
    if (!invoiceNumber.startsWith(`${prefix}-`)) {
      redirect(
        '/dashboard/invoices/new?error=' +
          encodeURIComponent(
            `Invoice number must start with your prefix: ${prefix}-`
          )
      )
    }

    if (!(await isInvoiceNumberUnique(supabase, user.id, invoiceNumber))) {
      redirect(
        '/dashboard/invoices/new?error=' +
          encodeURIComponent(
            `Invoice number "${invoiceNumber}" already exists. Please use a different number or leave blank to auto-generate.`
          )
      )
    }
  }

  // Calculate amounts
  const subtotal = parseFloat(formData.get('amount') as string)
  const currency = formData.get('currency') as string

  // Convert invoice amount to NOK for threshold check
  const invoiceAmountNOK = subtotal * (FALLBACK_RATES[currency] || 1)

  // Calculate VAT based on CURRENT settings at time of creation
  const vatCalc = await calculateInvoiceVAT(
    supabase,
    user.id,
    clientCountry,
    invoiceAmountNOK
  )

  const vatAmount = vatCalc.vatRate > 0 ? (subtotal * vatCalc.vatRate) / 100 : 0
  const totalWithVAT = subtotal + vatAmount

  // STORE the calculated VAT in the invoice (snapshot at creation time)
  const invoiceData = {
    user_id: user.id,
    client_id: clientId,
    invoice_number: invoiceNumber,
    issue_date: formData.get('issue_date') as string,
    due_date: formData.get('due_date') as string,
    description: formData.get('description') as string,
    amount: subtotal,
    vat_rate: vatCalc.vatRate,
    vat_amount: vatAmount,
    amount_with_vat: totalWithVAT,
    currency: currency,
    mva_registered_at_creation: vatCalc.mvaRegistered,
    status: 'draft',
  }

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert(invoiceData)
    .select()
    .single()

  if (error) {
    redirect('/dashboard/invoices?error=' + encodeURIComponent(error.message))
  }

  // Handle line items
  const itemsJson = formData.get('items') as string
  if (itemsJson) {
    const items = JSON.parse(itemsJson)
    const lineItems = items.map((item: LineItemInput, index: number) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.amount,
      sort_order: index,
    }))

    await supabase.from('invoice_items').insert(lineItems)
  }

  revalidatePath('/dashboard/invoices')

  // If user must register now, redirect with alert
  if (vatCalc.alertUser) {
    redirect(
      '/dashboard/invoices?alert=' +
        encodeURIComponent(
          'CRITICAL: You have crossed the NOK 50,000 MVA threshold. You are legally required to register for MVA immediately. This invoice includes 25% VAT and shows: "Selskapet er under registrering i Merverdiavgiftsregisteret."'
        )
    )
  }

  redirect('/dashboard/invoices')
}

export async function updateInvoice(id: string, formData: FormData) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get invoice to check client
  const { data: existingInvoice } = await supabase
    .from('invoices')
    .select('client_id')
    .eq('id', id)
    .single()

  if (!existingInvoice) {
    redirect('/dashboard/invoices?error=Invoice not found')
  }

  // Get client country
  const { data: client } = await supabase
    .from('clients')
    .select('country')
    .eq('id', existingInvoice.client_id)
    .single()

  const clientCountry = client?.country || 'NO'

  // Get user's prefix
  let prefix: string
  try {
    prefix = await getUserPrefix(supabase, user.id)
  } catch (error: any) {
    redirect(
      `/dashboard/invoices/${id}/edit?error=` +
        encodeURIComponent(error.message)
    )
    return
  }

  // Handle invoice number validation
  const invoiceNumber = (formData.get('invoice_number') as string)?.trim()

  if (!invoiceNumber || invoiceNumber === '') {
    redirect(`/dashboard/invoices/${id}/edit?error=Invoice number is required`)
  }

  if (!invoiceNumber.startsWith(`${prefix}-`)) {
    redirect(
      `/dashboard/invoices/${id}/edit?error=` +
        encodeURIComponent(
          `Invoice number must start with your prefix: ${prefix}-`
        )
    )
  }

  if (!(await isInvoiceNumberUnique(supabase, user.id, invoiceNumber, id))) {
    redirect(
      `/dashboard/invoices/${id}/edit?error=` +
        encodeURIComponent(
          `Invoice number "${invoiceNumber}" already exists. Please use a different number.`
        )
    )
  }

  // Calculate amounts
  const subtotal = parseFloat(formData.get('amount') as string)
  const currency = formData.get('currency') as string

  // Convert to NOK for threshold check
  const invoiceAmountNOK = subtotal * (FALLBACK_RATES[currency] || 1)

  // Calculate VAT based on CURRENT settings at time of update
  const vatCalc = await calculateInvoiceVAT(
    supabase,
    user.id,
    clientCountry,
    invoiceAmountNOK
  )

  const vatAmount = vatCalc.vatRate > 0 ? (subtotal * vatCalc.vatRate) / 100 : 0
  const totalWithVAT = subtotal + vatAmount

  // STORE the recalculated VAT in the invoice
  const data = {
    invoice_number: invoiceNumber,
    issue_date: formData.get('issue_date') as string,
    due_date: formData.get('due_date') as string,
    description: formData.get('description') as string,
    amount: subtotal,
    vat_rate: vatCalc.vatRate,
    vat_amount: vatAmount,
    amount_with_vat: totalWithVAT,
    currency: currency,
    mva_registered_at_creation: vatCalc.mvaRegistered,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('invoices')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    redirect('/dashboard/invoices?error=' + encodeURIComponent(error.message))
  }

  // Update line items - delete old ones and insert new
  await supabase.from('invoice_items').delete().eq('invoice_id', id)

  const itemsJson = formData.get('items') as string
  if (itemsJson) {
    const items = JSON.parse(itemsJson)
    const lineItems = items.map((item: LineItemInput, index: number) => ({
      invoice_id: id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.amount,
      sort_order: index,
    }))

    await supabase.from('invoice_items').insert(lineItems)
  }

  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')
}

export async function deleteInvoice(id: string) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    redirect('/dashboard/invoices?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/dashboard/invoices')
}

export async function getOverdueInvoices() {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const today = new Date().toISOString().split('T')[0]

  const { data: invoices } = await supabase
    .from('invoices')
    .select(
      `
      id,
      invoice_number,
      due_date,
      amount,
      currency,
      clients (
        name
      )
    `
    )
    .eq('user_id', user.id)
    .eq('payment_received', false)
    .lt('due_date', today)
    .order('due_date', { ascending: true })

  return invoices || []
}

export async function markInvoiceAsPaid(invoiceId: string) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  await supabase
    .from('invoices')
    .update({
      payment_received: true,
      payment_date: new Date().toISOString(),
      status: 'paid',
    })
    .eq('id', invoiceId)
    .eq('user_id', user.id)

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/invoices')
}

export async function dismissOverdueCheck() {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  await supabase
    .from('user_profiles')
    .update({
      last_overdue_check: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  revalidatePath('/dashboard')
}

export async function shouldShowOverdueCheck(): Promise<boolean> {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('last_overdue_check')
    .eq('user_id', user.id)
    .single()

  if (!profile?.last_overdue_check) {
    return true
  }

  const lastCheck = new Date(profile.last_overdue_check)
  const today = new Date()

  return lastCheck.toDateString() !== today.toDateString()
}
