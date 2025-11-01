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

  // Fetch all invoices with clients
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
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-2 text-slate-600">
          Overview of your invoicing activity
        </p>
      </div>

      {/* Currency-converted analytics - client component */}
      <AnalyticsClient
        invoices={typedInvoices}
        defaultCurrency={defaultCurrency}
        displayCurrency={displayCurrency}
      />

      {/* Status Breakdown */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status Breakdown</CardTitle>
            <CardDescription>Current status of all invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border bg-slate-50 p-4">
                <div className="text-2xl font-bold text-slate-700">
                  {statusCounts.draft}
                </div>
                <div className="text-sm text-slate-600">Draft</div>
              </div>
              <div className="rounded-lg border bg-blue-50 p-4">
                <div className="text-2xl font-bold text-blue-700">
                  {statusCounts.sent}
                </div>
                <div className="text-sm text-blue-600">Sent</div>
              </div>
              <div className="rounded-lg border bg-green-50 p-4">
                <div className="text-2xl font-bold text-green-700">
                  {statusCounts.paid}
                </div>
                <div className="text-sm text-green-600">Paid</div>
              </div>
              <div className="rounded-lg border bg-red-50 p-4">
                <div className="text-2xl font-bold text-red-700">
                  {statusCounts.overdue}
                </div>
                <div className="text-sm text-red-600">Overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>
            Latest 10 invoices with current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {typedInvoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {typedInvoices.slice(0, 10).map((invoice) => {
                  const dueDate = new Date(invoice.due_date)
                  dueDate.setHours(0, 0, 0, 0)
                  const isOverdue = dueDate < today && invoice.status !== 'paid'
                  const displayStatus = isOverdue ? 'overdue' : invoice.status

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {invoice.invoice_number}
                        </Link>
                      </TableCell>
                      <TableCell>{invoice.clients?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {new Date(invoice.issue_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            isOverdue ? 'text-red-600 font-semibold' : ''
                          }
                        >
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={displayStatus} />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-slate-500 py-8">No invoices yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
