// app/actions/settings.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'

function validatePrefix(prefix: string): boolean {
  // 2-6 characters, uppercase letters and numbers only
  return /^[A-Z0-9]{2,6}$/.test(prefix)
}

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const invoicePrefix = (formData.get('invoice_prefix') as string)
    ?.trim()
    .toUpperCase()

  // Validate prefix
  if (!invoicePrefix) {
    redirect(
      '/dashboard/settings?error=' +
        encodeURIComponent('Invoice prefix is required')
    )
  }

  if (!validatePrefix(invoicePrefix)) {
    redirect(
      '/dashboard/settings?error=' +
        encodeURIComponent(
          'Invoice prefix must be 2-6 uppercase letters/numbers'
        )
    )
  }

  // Check if prefix is already taken by another user
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('invoice_prefix', invoicePrefix)
    .neq('user_id', user.id)
    .single()

  if (existingProfile) {
    redirect(
      '/dashboard/settings?error=' +
        encodeURIComponent(
          `Prefix "${invoicePrefix}" is already taken. Please choose another.`
        )
    )
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
    invoice_prefix: invoicePrefix,
    default_currency: (formData.get('default_currency') as string) || 'PLN',
    show_logo_on_invoice: formData.get('show_logo_on_invoice') === 'on',
    updated_at: new Date().toISOString(),
  }

  // Check if profile exists
  const { data: currentProfile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  let error

  if (currentProfile) {
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
