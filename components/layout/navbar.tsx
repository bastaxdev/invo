// components/layout/navbar.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { calculateLast12MonthsRevenueNOK } from '@/app/actions/mva'
import { NavbarClient } from './navbar-client'

export async function Navbar() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile for logo and name
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('mva_registered, logo_url, business_name, full_name')
    .eq('user_id', user.id)
    .single()

  const revenueNOK = await calculateLast12MonthsRevenueNOK()

  return (
    <NavbarClient
      user={{ email: user.email }}
      profile={profile}
      revenueNOK={revenueNOK}
    />
  )
}
