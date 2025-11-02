// app/actions/mva.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'

// Exchange rates (approximate, you may want to fetch these from an API)
const EXCHANGE_RATES: { [key: string]: number } = {
  NOK: 1,
  PLN: 0.42, // 1 PLN ≈ 0.42 NOK
  EUR: 11.5, // 1 EUR ≈ 11.5 NOK
  USD: 10.5, // 1 USD ≈ 10.5 NOK
}

function convertToNOK(amount: number, currency: string): number {
  const rate = EXCHANGE_RATES[currency] || 1
  return amount * rate
}

export async function calculateLast12MonthsRevenueNOK(): Promise<number> {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return 0
  }

  // Get date 12 months ago
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
  const cutoffDate = twelveMonthsAgo.toISOString().split('T')[0]

  // Fetch all invoices from last 12 months
  const { data: invoices } = await supabase
    .from('invoices')
    .select('amount, currency, issue_date')
    .eq('user_id', user.id)
    .gte('issue_date', cutoffDate)

  if (!invoices) {
    return 0
  }

  // Convert all to NOK and sum
  const totalNOK = invoices.reduce((sum, invoice) => {
    return sum + convertToNOK(invoice.amount, invoice.currency)
  }, 0)

  return Math.round(totalNOK * 100) / 100 // Round to 2 decimals
}

export async function shouldShowMVAPopup(): Promise<boolean> {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  // Check if user is already registered for MVA
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('mva_registered, last_mva_popup')
    .eq('user_id', user.id)
    .single()

  // Don't show if already registered
  if (profile?.mva_registered) {
    return false
  }

  // Check if we're approaching the limit
  const revenue = await calculateLast12MonthsRevenueNOK()

  // Show popup when revenue exceeds 40,000 NOK (80% of limit)
  if (revenue < 40000) {
    return false
  }

  // Check if we've shown the popup today
  if (profile?.last_mva_popup) {
    const lastPopup = new Date(profile.last_mva_popup)
    const today = new Date()

    // Show if last popup was on a different day
    if (lastPopup.toDateString() === today.toDateString()) {
      return false
    }
  }

  return true
}

export async function dismissMVAPopup() {
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
      last_mva_popup: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  revalidatePath('/dashboard')
}

export async function updateMVARegistrationStatus(registered: boolean) {
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
      mva_registered: registered,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
}
