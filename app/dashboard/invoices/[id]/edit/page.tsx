// app/dashboard/invoices/[id]/edit/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateInvoice } from '@/app/actions/invoices'
import { InvoiceFormSimplified } from '@/components/invoices/invoice-form-simplified'
import { calculateLast12MonthsRevenueNOK } from '@/app/actions/mva'

export default async function EditInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const queryParams = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the invoice
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!invoice) {
    redirect('/dashboard/invoices?error=Invoice not found')
  }

  // Fetch invoice items
  const { data: invoiceItems } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', id)
    .order('sort_order', { ascending: true })

  // Fetch clients
  const { data: clients } = await supabase
    .from('clients')
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
        <h1 className="text-3xl font-bold text-foreground">Edit Invoice</h1>
        <p className="mt-2 text-muted-foreground">
          Update invoice {invoice.invoice_number}
        </p>
      </div>

      {queryParams.error && (
        <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {queryParams.error}
        </div>
      )}

      <InvoiceFormSimplified
        clients={clients || []}
        invoice={invoice}
        invoiceItems={invoiceItems || []}
        action={updateInvoice.bind(null, id)}
        mvaRegistered={mvaRegistered}
        revenueExceeded={revenueExceeded}
      />
    </div>
  )
}
