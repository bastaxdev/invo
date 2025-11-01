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
import { InvoiceFormSimplified } from '@/components/invoices/invoice-form-simplified'
import { ProfileGuard } from '@/components/layout/profile-guard'

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
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

  const { data: templates } = await supabase
    .from('invoice_templates')
    .select('id, name, currency, default_due_days')
    .order('name')

  return (
    <ProfileGuard>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Invoice</CardTitle>
            <CardDescription>
              Create a new invoice for your Norwegian client
            </CardDescription>
          </CardHeader>
          <CardContent>
            {params.error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
                {params.error}
              </div>
            )}
            <InvoiceFormSimplified
              clients={clients || []}
              templates={templates || []}
              action={createInvoice}
            />
          </CardContent>
        </Card>
      </div>
    </ProfileGuard>
  )
}
