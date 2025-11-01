// app/actions/settings.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profileData = {
    user_id: user.id,
    full_name: formData.get('full_name') as string,
    business_name: formData.get('business_name') as string,
    tax_id: formData.get('tax_id') as string,
    address: formData.get('address') as string,
    phone: formData.get('phone') as string,
    bank_account: formData.get('bank_account') as string,
    bank_name: formData.get('bank_name') as string,
    bank_address: formData.get('bank_address') as string,
    swift_bic: formData.get('swift_bic') as string,
    company_registration: formData.get('company_registration') as string,
    updated_at: new Date().toISOString(),
  }

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  let error

  if (existingProfile) {
    // Update existing profile
    const result = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('user_id', user.id)
    error = result.error
  } else {
    // Insert new profile
    const result = await supabase.from('user_profiles').insert(profileData)
    error = result.error
  }

  if (error) {
    redirect('/dashboard/settings?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/dashboard/settings')
  redirect('/dashboard/settings?success=true')
}
