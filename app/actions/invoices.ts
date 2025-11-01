// app/actions/invoices.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'

async function generateInvoiceNumber(
  supabase: any,
  userId: string
): Promise<string> {
  // Get all invoice numbers for this user
  const { data: invoices } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!invoices || invoices.length === 0) {
    return 'INV-001'
  }

  // Extract numbers from all INV-XXX format invoices
  const numbers = invoices
    .map((inv: any) => {
      const match = inv.invoice_number.match(/INV-(\d+)/)
      return match ? parseInt(match[1]) : 0
    })
    .filter((num: number) => num > 0)

  if (numbers.length === 0) {
    return 'INV-001'
  }

  // Get the highest number and increment
  const maxNumber = Math.max(...numbers)
  const nextNumber = maxNumber + 1

  return `INV-${nextNumber.toString().padStart(3, '0')}`
}

async function isInvoiceNumberUnique(
  supabase: any,
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

  // Handle invoice number
  let invoiceNumber = (formData.get('invoice_number') as string)?.trim()

  if (!invoiceNumber || invoiceNumber === '') {
    // Auto-generate
    invoiceNumber = await generateInvoiceNumber(supabase, user.id)

    // Double-check uniqueness and increment if needed
    while (!(await isInvoiceNumberUnique(supabase, user.id, invoiceNumber))) {
      const match = invoiceNumber.match(/INV-(\d+)/)
      if (match) {
        const num = parseInt(match[1]) + 1
        invoiceNumber = `INV-${num.toString().padStart(3, '0')}`
      } else {
        invoiceNumber = 'INV-001'
      }
    }
  } else {
    // User provided a number - check if it's unique
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

export async function updateInvoice(id: string, formData: FormData) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Handle invoice number validation
  const invoiceNumber = (formData.get('invoice_number') as string)?.trim()

  if (!invoiceNumber || invoiceNumber === '') {
    redirect(`/dashboard/invoices/${id}/edit?error=Invoice number is required`)
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
