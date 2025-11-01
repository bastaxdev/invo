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
import { AdvancedInvoiceForm } from '@/components/invoices/advanced-invoice-form'

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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
          <AdvancedInvoiceForm
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
