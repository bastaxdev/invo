// app/dashboard/analytics/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import { StatusBadge } from '@/components/invoices/status-badge'
import { formatCurrency } from '@/lib/currency'
import { AnalyticsClient } from '@/components/analytics/analytics-client'

interface Invoice {
  id: string
  invoice_number: string
  issue_date: string
  due_date: string
  amount: number
  vat_rate: number
  vat_amount: number
  amount_with_vat: number
  currency: string
  status: string
  clients: {
    name: string
  } | null
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ currency?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile for default currency
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('default_currency')
    .eq('user_id', user.id)
    .single()

  const defaultCurrency = profile?.default_currency || 'PLN'
  const displayCurrency = params.currency || defaultCurrency

  // Fetch all invoices with clients and VAT data
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

  const typedInvoices = (invoices as Invoice[]) || []

  // Count by status
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const statusCounts = {
    draft: 0,
    sent: 0,
    paid: 0,
    overdue: 0,
  }

  typedInvoices.forEach((inv) => {
    const dueDate = new Date(inv.due_date)
    dueDate.setHours(0, 0, 0, 0)

    if (dueDate < today && inv.status !== 'paid') {
      statusCounts.overdue++
    } else {
      statusCounts[inv.status as keyof typeof statusCounts]++
    }
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="mt-2 text-muted-foreground">
          Comprehensive overview of your financial performance
        </p>
      </div>

      {/* Currency-converted analytics with VAT tracking - client component */}
      <AnalyticsClient
        invoices={typedInvoices}
        defaultCurrency={defaultCurrency}
        displayCurrency={displayCurrency}
      />

      {/* Status Breakdown - TONED DOWN COLORS */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">
              Invoice Status Breakdown
            </CardTitle>
            <CardDescription>Current status of all invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {/* Draft - Neutral */}
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-2xl font-bold text-foreground">
                  {statusCounts.draft}
                </div>
                <div className="text-sm text-muted-foreground">Draft</div>
              </div>

              {/* Sent - Subtle Blue */}
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-2xl font-bold text-foreground">
                  {statusCounts.sent}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Sent
                </div>
              </div>

              {/* Paid - Subtle Green */}
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-2xl font-bold text-foreground">
                  {statusCounts.paid}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Paid
                </div>
              </div>

              {/* Overdue - Subtle Red */}
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-2xl font-bold text-foreground">
                  {statusCounts.overdue}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">
                  Overdue
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Recent Invoices</CardTitle>
          <CardDescription>
            Latest 10 invoices with current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {typedInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-foreground font-semibold">
                      Invoice #
                    </TableHead>
                    <TableHead className="text-foreground font-semibold">
                      Client
                    </TableHead>
                    <TableHead className="text-foreground font-semibold">
                      Issue Date
                    </TableHead>
                    <TableHead className="text-foreground font-semibold">
                      Due Date
                    </TableHead>
                    <TableHead className="text-right text-foreground font-semibold">
                      Net Amount
                    </TableHead>
                    <TableHead className="text-right text-foreground font-semibold">
                      VAT
                    </TableHead>
                    <TableHead className="text-right text-foreground font-semibold">
                      Total
                    </TableHead>
                    <TableHead className="text-foreground font-semibold">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {typedInvoices.slice(0, 10).map((invoice) => {
                    const dueDate = new Date(invoice.due_date)
                    dueDate.setHours(0, 0, 0, 0)
                    const isOverdue =
                      dueDate < today && invoice.status !== 'paid'
                    const displayStatus = isOverdue ? 'overdue' : invoice.status

                    return (
                      <TableRow key={invoice.id} className="border-border">
                        <TableCell className="font-medium text-foreground">
                          <Link
                            href={`/dashboard/invoices/${invoice.id}`}
                            className="text-primary hover:underline"
                          >
                            {invoice.invoice_number}
                          </Link>
                        </TableCell>
                        <TableCell className="text-foreground">
                          {invoice.clients?.name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(invoice.issue_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              isOverdue
                                ? 'text-red-600 dark:text-red-400 font-semibold'
                                : 'text-muted-foreground'
                            }
                          >
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-foreground">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(
                            invoice.vat_amount || 0,
                            invoice.currency
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-foreground">
                          {formatCurrency(
                            invoice.amount_with_vat || invoice.amount,
                            invoice.currency
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={displayStatus} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No invoices yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
