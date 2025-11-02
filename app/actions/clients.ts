// app/actions/clients.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'

export async function createClient(formData: FormData) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const data = {
    user_id: user.id,
    name: formData.get('name') as string,
    org_number: (formData.get('org_number') as string) || null,
    address: formData.get('address') as string,
    country: (formData.get('country') as string) || 'NO',
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    tax_id: (formData.get('tax_id') as string) || null,
  }

  // Basic validation - only name and address are required
  if (!data.name || !data.address) {
    redirect(
      '/dashboard/clients?error=' +
        encodeURIComponent(
          'Please fill in all required fields (Name and Address)'
        )
    )
  }

  const { error } = await supabase.from('clients').insert(data)

  if (error) {
    redirect('/dashboard/clients?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/dashboard/clients')
  redirect('/dashboard/clients')
}

export async function updateClient(id: string, formData: FormData) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const data = {
    name: formData.get('name') as string,
    org_number: (formData.get('org_number') as string) || null,
    address: formData.get('address') as string,
    country: (formData.get('country') as string) || 'NO',
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    tax_id: (formData.get('tax_id') as string) || null,
    updated_at: new Date().toISOString(),
  }

  // Basic validation - only name and address are required
  if (!data.name || !data.address) {
    redirect(
      '/dashboard/clients?error=' +
        encodeURIComponent(
          'Please fill in all required fields (Name and Address)'
        )
    )
  }

  const { error } = await supabase
    .from('clients')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    redirect('/dashboard/clients?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/dashboard/clients')
  redirect('/dashboard/clients')
}

export async function deleteClient(id: string) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    redirect('/dashboard/clients?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/dashboard/clients')
}
