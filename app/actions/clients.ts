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
    org_number: formData.get('org_number') as string,
    address: formData.get('address') as string,
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
    org_number: formData.get('org_number') as string,
    address: formData.get('address') as string,
    updated_at: new Date().toISOString(),
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
