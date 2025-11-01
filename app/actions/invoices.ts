// app/actions/invoices.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'

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
    // Create new client first
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

  const invoiceData = {
    user_id: user.id,
    client_id: clientId,
    invoice_number: formData.get('invoice_number') as string,
    issue_date: formData.get('issue_date') as string,
    due_date: formData.get('due_date') as string,
    description: formData.get('description') as string,
    amount: parseFloat(formData.get('amount') as string),
    currency: formData.get('currency') as string,
  }

  const { error } = await supabase.from('invoices').insert(invoiceData)

  if (error) {
    redirect('/dashboard/invoices?error=' + encodeURIComponent(error.message))
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

  const data = {
    client_id: formData.get('client_id') as string,
    invoice_number: formData.get('invoice_number') as string,
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
