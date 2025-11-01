// app/dashboard/invoices/new/page.tsx
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { createInvoice } from '@/app/actions/invoices'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { InvoiceForm } from '@/components/invoices/invoice-form'

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('name')

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Invoice</CardTitle>
          <CardDescription>
            Create a new invoice for your Norwegian client
          </CardDescription>
        </CardHeader>
        <CardContent>
          {searchParams.error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
              {searchParams.error}
            </div>
          )}
          <InvoiceForm clients={clients || []} action={createInvoice} />
        </CardContent>
      </Card>
    </div>
  )
}
