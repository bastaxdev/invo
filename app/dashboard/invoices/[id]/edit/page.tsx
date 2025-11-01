// app/dashboard/invoices/[id]/edit/page.tsx
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { updateInvoice } from '@/app/actions/invoices'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { InvoiceFormSimplified } from '@/components/invoices/invoice-form-simplified'

export default async function EditInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const params2 = await searchParams
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!invoice) {
    redirect('/dashboard/invoices')
  }

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('name')

  const { data: invoiceItems } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', id)
    .order('sort_order')

  const updateInvoiceWithId = updateInvoice.bind(null, id)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Invoice</CardTitle>
          <CardDescription>Update invoice information</CardDescription>
        </CardHeader>
        <CardContent>
          {params2.error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
              {params2.error}
            </div>
          )}
          <InvoiceFormSimplified
            clients={clients || []}
            invoice={invoice}
            invoiceItems={invoiceItems || undefined}
            action={updateInvoiceWithId}
          />
        </CardContent>
      </Card>
    </div>
  )
}
