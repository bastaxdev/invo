// app/dashboard/invoices/[id]/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { GeneratePDFButton } from '@/components/invoices/generate-pdf-button'

export default async function InvoiceViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: invoice } = await supabase
    .from('invoices')
    .select(
      `
      *,
      clients (
        id,
        name,
        org_number,
        address
      )
    `
    )
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!invoice) {
    redirect('/dashboard/invoices')
  }

  const { data: invoiceItems } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', id)
    .order('sort_order')

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Invoice Details</h1>
        <GeneratePDFButton
          invoice={invoice}
          invoiceItems={invoiceItems || undefined}
          user={user}
          userProfile={userProfile}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Invoice Number
              </p>
              <p className="text-lg font-semibold">{invoice.invoice_number}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Issue Date</p>
              <p>{new Date(invoice.issue_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Due Date</p>
              <p>{new Date(invoice.due_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Amount</p>
              <p className="text-2xl font-bold">
                {invoice.amount.toLocaleString('nb-NO', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                {invoice.currency}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Mode</p>
              <p className="capitalize">{invoice.mode || 'simple'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Client Name</p>
              <p className="font-semibold">{invoice.clients?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Organization Number
              </p>
              <p>{invoice.clients?.org_number}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Address</p>
              <p>{invoice.clients?.address}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            {invoiceItems && invoiceItems.length > 0 ? (
              <div className="space-y-4">
                {invoiceItems.map((item, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <p className="font-medium">{item.description}</p>
                    <div className="mt-2 flex gap-4 text-sm text-slate-600">
                      <span>Qty: {item.quantity}</span>
                      <span>Price: {item.unit_price.toFixed(2)}</span>
                      <span className="font-semibold">
                        Amount: {item.amount.toFixed(2)} {invoice.currency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{invoice.description}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex gap-4">
        <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
          <Button variant="outline">Edit Invoice</Button>
        </Link>
        <Link href="/dashboard/invoices">
          <Button variant="outline">← Back to Invoices</Button>
        </Link>
      </div>
    </div>
  )
}
