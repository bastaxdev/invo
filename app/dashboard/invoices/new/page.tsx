import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createInvoice } from '@/app/actions/invoices'
import { InvoiceFormSimplified } from '@/components/invoices/invoice-form-simplified'
import { calculateLast12MonthsRevenueNOK } from '@/app/actions/mva'

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch clients
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true })

  // Fetch templates
  const { data: templates } = await supabase
    .from('invoice_templates')
    .select('*')
    .order('name', { ascending: true })

  // Get MVA status
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('mva_registered')
    .eq('user_id', user.id)
    .single()

  const mvaRegistered = profile?.mva_registered || false
  const revenueNOK = await calculateLast12MonthsRevenueNOK()
  const revenueExceeded = revenueNOK >= 50000

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Create Invoice</h1>
        <p className="mt-2 text-slate-600">
          Generate a new invoice for your client
        </p>
      </div>

      {params.error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
          {params.error}
        </div>
      )}

      <InvoiceFormSimplified
        clients={clients || []}
        templates={templates || []}
        action={createInvoice}
        mvaRegistered={mvaRegistered}
        revenueExceeded={revenueExceeded}
      />
    </div>
  )
}
