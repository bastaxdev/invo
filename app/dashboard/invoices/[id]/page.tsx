// app/dashboard/invoices/[id]/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { GeneratePDFButton } from '@/components/invoices/generate-pdf-button'
import { SendEmailDialog } from '@/components/invoices/send-email-dialog'
import { UpdateStatusDialog } from '@/components/invoices/update-status-dialog'
import { StatusBadge } from '@/components/invoices/status-badge'

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
        address,
        country
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

  const vatRate = invoice.vat_rate ?? 0
  const vatAmount = invoice.vat_amount ?? 0
  const total = invoice.amount_with_vat ?? invoice.amount

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Invoice Details
        </h1>
        <div className="flex flex-wrap gap-4">
          <GeneratePDFButton
            invoice={invoice}
            invoiceItems={invoiceItems || undefined}
            user={user}
            userProfile={userProfile}
          />
          <SendEmailDialog
            invoiceId={invoice.id}
            invoiceNumber={invoice.invoice_number}
          />
          <UpdateStatusDialog
            invoiceId={invoice.id}
            currentStatus={invoice.status}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">
              Invoice Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Invoice Number
              </p>
              <p className="text-lg font-semibold text-foreground">
                {invoice.invoice_number}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Issue Date
              </p>
              <p className="text-foreground">
                {new Date(invoice.issue_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Due Date
              </p>
              <p className="text-foreground">
                {new Date(invoice.due_date).toLocaleDateString()}
              </p>
            </div>

            {/* Amount Breakdown with VAT */}
            <div className="space-y-2 border-t border-border pt-4">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Subtotal:
                </p>
                <p className="font-medium text-foreground">
                  {invoice.amount.toLocaleString('nb-NO', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  {invoice.currency}
                </p>
              </div>

              {vatRate > 0 ? (
                <div className="flex justify-between text-green-700 dark:text-green-400">
                  <p className="text-sm font-medium">VAT ({vatRate}%):</p>
                  <p className="font-medium">
                    {vatAmount.toLocaleString('nb-NO', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    {invoice.currency}
                  </p>
                </div>
              ) : (
                <div className="flex justify-between text-muted-foreground">
                  <p className="text-sm font-medium">VAT:</p>
                  <p className="font-medium">0%</p>
                </div>
              )}

              <div className="flex justify-between border-t border-border pt-2">
                <p className="text-sm font-semibold text-foreground">Total:</p>
                <p className="text-2xl font-bold text-foreground">
                  {total.toLocaleString('nb-NO', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  {invoice.currency}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <div className="mt-1">
                <StatusBadge status={invoice.status} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Client Name
              </p>
              <p className="font-semibold text-foreground">
                {invoice.clients?.name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Organization Number
              </p>
              <p className="text-foreground">{invoice.clients?.org_number}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Address
              </p>
              <p className="text-foreground">{invoice.clients?.address}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            {invoiceItems && invoiceItems.length > 0 ? (
              <div className="space-y-4">
                {invoiceItems.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border p-4"
                  >
                    <p className="font-medium text-foreground">
                      {item.description}
                    </p>
                    <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                      <span>Qty: {item.quantity}</span>
                      <span>Price: {item.unit_price.toFixed(2)}</span>
                      <span className="font-semibold text-foreground">
                        Amount: {item.amount.toFixed(2)} {invoice.currency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-foreground">
                {invoice.description}
              </p>
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
