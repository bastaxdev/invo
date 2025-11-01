// components/layout/profile-guard.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function ProfileGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if profile is complete
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const isProfileIncomplete =
    !profile ||
    !profile.full_name ||
    !profile.address ||
    !profile.invoice_prefix

  if (isProfileIncomplete) {
    const missingFields = []
    if (!profile?.full_name) missingFields.push('Full Name')
    if (!profile?.address) missingFields.push('Address')
    if (!profile?.invoice_prefix) missingFields.push('Invoice Prefix')

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-lg border-2 border-yellow-400 bg-yellow-50 p-8 text-center">
            <div className="mb-4 text-6xl">⚠️</div>
            <h2 className="mb-4 text-2xl font-bold text-slate-900">
              Complete Your Profile First
            </h2>
            <p className="mb-6 text-slate-700">
              Before creating invoices, you need to complete your profile
              information. This information will appear on your generated
              invoices.
            </p>
            <p className="mb-8 text-sm text-slate-600">
              Missing: {missingFields.join(', ')}
            </p>
            <a
              href="/dashboard/settings"
              className="inline-block rounded-md bg-slate-900 px-6 py-3 text-white hover:bg-slate-800"
            >
              Complete Profile Now
            </a>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
