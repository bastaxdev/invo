// app/dashboard/invoices/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { DeleteInvoiceButton } from '@/components/invoices/delete-invoice-button'
import { StatusBadge } from '@/components/invoices/status-badge'
import {
  getOverdueInvoices,
  shouldShowOverdueCheck,
} from '@/app/actions/invoices'
import { OverdueInvoiceDialog } from '@/components/invoices/overdue-invoice-dialog'
import { FileText, Calendar, DollarSign } from 'lucide-react'

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; alert?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: invoices } = await supabase
    .from('invoices')
    .select(
      `
      *,
      clients (
        name
      )
    `
    )
    .order('created_at', { ascending: false })

  const showOverdueCheck = await shouldShowOverdueCheck()
  const overdueInvoices = showOverdueCheck ? await getOverdueInvoices() : []

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
      {overdueInvoices.length > 0 && (
        <OverdueInvoiceDialog invoices={overdueInvoices} open={true} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Invoices
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
            Manage your invoices
          </p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button className="w-full sm:w-auto">Create Invoice</Button>
        </Link>
      </div>

      {/* Alerts */}
      {params.alert && (
        <div className="mb-4 rounded-md bg-destructive/10 border-2 border-destructive/50 p-4 text-sm text-destructive">
          <strong>⚠️ URGENT:</strong> {params.alert}
        </div>
      )}

      {params.error && (
        <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {params.error}
        </div>
      )}

      {/* Content */}
      {!invoices || invoices.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No invoices yet. Create your first invoice!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {invoices.map((invoice) => {
              const vatRate = invoice.vat_rate || 0
              const vatAmount = invoice.vat_amount || 0
              const total = invoice.amount_with_vat || invoice.amount

              return (
                <Card key={invoice.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-foreground text-base">
                          {invoice.invoice_number}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {invoice.clients?.name || 'N/A'}
                        </p>
                      </div>
                      <StatusBadge status={invoice.status} />
                    </div>

                    {/* Details Grid */}
                    <div className="space-y-2 mb-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          Issue Date
                        </span>
                        <span className="font-medium text-foreground">
                          {new Date(invoice.issue_date).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium text-foreground">
                          {invoice.amount.toLocaleString('nb-NO', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          {invoice.currency}
                        </span>
                      </div>

                      {vatRate > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">
                            VAT ({vatRate}%)
                          </span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {vatAmount.toLocaleString('nb-NO', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{' '}
                            {invoice.currency}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-border">
                        <span className="text-foreground font-semibold flex items-center gap-1.5">
                          <DollarSign className="h-4 w-4" />
                          Total
                        </span>
                        <span className="font-bold text-foreground">
                          {total.toLocaleString('nb-NO', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          {invoice.currency}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3 border-t border-border">
                      <Link
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          View
                        </Button>
                      </Link>
                      <Link
                        href={`/dashboard/invoices/${invoice.id}/edit`}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          Edit
                        </Button>
                      </Link>
                      <DeleteInvoiceButton
                        id={invoice.id}
                        invoiceNumber={invoice.invoice_number}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block rounded-lg border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead>VAT</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const vatRate = invoice.vat_rate || 0
                  const vatAmount = invoice.vat_amount || 0
                  const total = invoice.amount_with_vat || invoice.amount

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium text-foreground">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell className="text-card-foreground">
                        {invoice.clients?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(invoice.issue_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-card-foreground">
                        {invoice.amount.toLocaleString('nb-NO', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        {invoice.currency}
                      </TableCell>
                      <TableCell>
                        {vatRate > 0 ? (
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            {vatRate}% (
                            {vatAmount.toLocaleString('nb-NO', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                            )
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0%</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {total.toLocaleString('nb-NO', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        {invoice.currency}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/invoices/${invoice.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                          <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                          <DeleteInvoiceButton
                            id={invoice.id}
                            invoiceNumber={invoice.invoice_number}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
