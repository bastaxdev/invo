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
import Link from 'next/link'
import { DeleteInvoiceButton } from '@/components/invoices/delete-invoice-button'
import { StatusBadge } from '@/components/invoices/status-badge'
import {
  getOverdueInvoices,
  shouldShowOverdueCheck,
} from '@/app/actions/invoices'
import { OverdueInvoiceDialog } from '@/components/invoices/overdue-invoice-dialog'

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

  // Check for overdue invoices
  const showOverdueCheck = await shouldShowOverdueCheck()
  const overdueInvoices = showOverdueCheck ? await getOverdueInvoices() : []

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Overdue Invoice Dialog */}
      {overdueInvoices.length > 0 && (
        <OverdueInvoiceDialog invoices={overdueInvoices} open={true} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Invoices</h1>
          <p className="mt-2 text-slate-600">Manage your invoices</p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button>Create Invoice</Button>
        </Link>
      </div>

      {params.alert && (
        <div className="mt-4 rounded-md bg-red-50 border-2 border-red-400 p-4 text-sm text-red-800">
          <strong>⚠️ URGENT:</strong> {params.alert}
        </div>
      )}

      {params.error && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
          {params.error}
        </div>
      )}

      <div className="mt-8">
        {!invoices || invoices.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">
              No invoices yet. Create your first invoice!
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white">
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
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>{invoice.clients?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {new Date(invoice.issue_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {invoice.amount.toLocaleString('nb-NO', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        {invoice.currency}
                      </TableCell>
                      <TableCell>
                        {vatRate > 0 ? (
                          <span className="text-green-700 font-medium">
                            {vatRate}% (
                            {vatAmount.toLocaleString('nb-NO', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                            )
                          </span>
                        ) : (
                          <span className="text-slate-500">0%</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">
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
        )}
      </div>
    </div>
  )
}
