// app/actions/invoices.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'

function generateRandomPrefix(): string {
  // Generate 3 random uppercase letters + 1 random digit
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const digits = '0123456789'

  let prefix = ''
  for (let i = 0; i < 3; i++) {
    prefix += letters.charAt(Math.floor(Math.random() * letters.length))
  }
  prefix += digits.charAt(Math.floor(Math.random() * digits.length))

  return prefix
}

async function getUserPrefix(supabase: any, userId: string): Promise<string> {
  // Get user's custom prefix from profile
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
  supabase: any,
  userId: string
): Promise<string> {
  // Get user's custom prefix
  const prefix = await getUserPrefix(supabase, userId)

  // Get all invoice numbers for this user
  const { data: invoices } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!invoices || invoices.length === 0) {
    return `${prefix}-001`
  }

  // Extract numbers from all PREFIX-XXX format invoices
  const numbers = invoices
    .map((inv: any) => {
      const match = inv.invoice_number.match(new RegExp(`${prefix}-(\\d+)`))
      return match ? parseInt(match[1]) : 0
    })
    .filter((num: number) => num > 0)

  if (numbers.length === 0) {
    return `${prefix}-001`
  }

  // Get the highest number and increment
  const maxNumber = Math.max(...numbers)
  const nextNumber = maxNumber + 1

  return `${prefix}-${nextNumber.toString().padStart(3, '0')}`
}

// Update createInvoice to catch the error if no prefix is set:
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

  // Get user's prefix
  let prefix: string
  try {
    prefix = await getUserPrefix(supabase, user.id)
  } catch (error: any) {
    redirect(
      '/dashboard/invoices/new?error=' + encodeURIComponent(error.message)
    )
  }

  // Handle invoice number
  let invoiceNumber = (formData.get('invoice_number') as string)?.trim()

  if (!invoiceNumber || invoiceNumber === '') {
    // Auto-generate with user's prefix
    invoiceNumber = await generateInvoiceNumber(supabase, user.id)

    // Double-check uniqueness and increment if needed
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
    // User provided a number - validate it uses their prefix
    if (!invoiceNumber.startsWith(`${prefix}-`)) {
      redirect(
        '/dashboard/invoices/new?error=' +
          encodeURIComponent(
            `Invoice number must start with your prefix: ${prefix}-`
          )
      )
    }

    // Check if it's unique
    if (!(await isInvoiceNumberUnique(supabase, user.id, invoiceNumber))) {
      redirect(
        '/dashboard/invoices/new?error=' +
          encodeURIComponent(
            `Invoice number "${invoiceNumber}" already exists. Please use a different number or leave blank to auto-generate.`
          )
      )
    }
  }

  const invoiceData = {
    user_id: user.id,
    client_id: clientId,
    invoice_number: invoiceNumber,
    issue_date: formData.get('issue_date') as string,
    due_date: formData.get('due_date') as string,
    description: formData.get('description') as string,
    amount: parseFloat(formData.get('amount') as string),
    currency: formData.get('currency') as string,
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
    const lineItems = items.map((item: any, index: number) => ({
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
  redirect('/dashboard/invoices')
}

// Update updateInvoice similarly:
export async function updateInvoice(id: string, formData: FormData) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's prefix
  let prefix: string
  try {
    prefix = await getUserPrefix(supabase, user.id)
  } catch (error: any) {
    redirect(
      `/dashboard/invoices/${id}/edit?error=` +
        encodeURIComponent(error.message)
    )
  }

  // Handle invoice number validation
  const invoiceNumber = (formData.get('invoice_number') as string)?.trim()

  if (!invoiceNumber || invoiceNumber === '') {
    redirect(`/dashboard/invoices/${id}/edit?error=Invoice number is required`)
  }

  // Validate it uses their prefix
  if (!invoiceNumber.startsWith(`${prefix}-`)) {
    redirect(
      `/dashboard/invoices/${id}/edit?error=` +
        encodeURIComponent(
          `Invoice number must start with your prefix: ${prefix}-`
        )
    )
  }

  // Check if number is unique (excluding current invoice)
  if (!(await isInvoiceNumberUnique(supabase, user.id, invoiceNumber, id))) {
    redirect(
      `/dashboard/invoices/${id}/edit?error=` +
        encodeURIComponent(
          `Invoice number "${invoiceNumber}" already exists. Please use a different number.`
        )
    )
  }

  const data = {
    invoice_number: invoiceNumber,
    issue_date: formData.get('issue_date') as string,
    due_date: formData.get('due_date') as string,
    description: formData.get('description') as string,
    amount: parseFloat(formData.get('amount') as string),
    currency: formData.get('currency') as string,
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
    const lineItems = items.map((item: any, index: number) => ({
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

// Keep deleteInvoice as is
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
