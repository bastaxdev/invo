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

interface RevenueByCurrency {
  [key: string]: number
}

interface MonthData {
  count: number
  amount: number
  currency: string
}

interface InvoicesByMonth {
  [key: string]: MonthData
}

interface ClientStats {
  [key: string]: {
    count: number
    amount: number
    currency: string
  }
}

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

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

  // Calculate statistics
  const totalInvoices = typedInvoices.length
  const totalRevenue = typedInvoices.reduce((sum, inv) => sum + inv.amount, 0)

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

    // Auto-calculate overdue if past due date and not paid
    if (dueDate < today && inv.status !== 'paid') {
      statusCounts.overdue++
    } else {
      statusCounts[inv.status as keyof typeof statusCounts]++
    }
  })

  // Group by currency
  const revenueByCurrency: RevenueByCurrency = typedInvoices.reduce(
    (acc, inv) => {
      acc[inv.currency] = (acc[inv.currency] || 0) + inv.amount
      return acc
    },
    {} as RevenueByCurrency
  )

  // Group by month
  const invoicesByMonth: InvoicesByMonth = typedInvoices.reduce((acc, inv) => {
    const month = new Date(inv.issue_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    })
    if (!acc[month]) {
      acc[month] = { count: 0, amount: 0, currency: inv.currency }
    }
    acc[month].count++
    acc[month].amount += inv.amount
    return acc
  }, {} as InvoicesByMonth)

  // Top clients
  const clientStats: ClientStats = typedInvoices.reduce((acc, inv) => {
    const clientName = inv.clients?.name || 'Unknown'
    if (!acc[clientName]) {
      acc[clientName] = { count: 0, amount: 0, currency: inv.currency }
    }
    acc[clientName].count++
    acc[clientName].amount += inv.amount
    return acc
  }, {} as ClientStats)

  const topClients = Object.entries(clientStats)
    .sort((a, b) => b[1].amount - a[1].amount)
    .slice(0, 5)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-2 text-slate-600">
          Overview of your invoicing activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader>
            <CardDescription>Total Invoices</CardDescription>
            <CardTitle className="text-3xl">{totalInvoices}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-3xl">
              {Object.entries(revenueByCurrency).map(
                ([currency, amount], index) => (
                  <div
                    key={currency}
                    className={index > 0 ? 'text-lg mt-1' : ''}
                  >
                    {amount.toLocaleString('nb-NO', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    {currency}
                  </div>
                )
              )}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Average Invoice</CardDescription>
            <CardTitle className="text-3xl">
              {totalInvoices > 0
                ? (totalRevenue / totalInvoices).toLocaleString('nb-NO', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : '0.00'}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Overdue Invoices</CardDescription>
            <CardTitle className="text-3xl">
              <span
                className={
                  statusCounts.overdue > 0 ? 'text-red-600' : 'text-green-600'
                }
              >
                {statusCounts.overdue}
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Breakdown</CardTitle>
            <CardDescription>Invoices per month</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(invoicesByMonth).length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(invoicesByMonth)
                    .slice(0, 6)
                    .map(([month, data]) => (
                      <TableRow key={month}>
                        <TableCell className="font-medium">{month}</TableCell>
                        <TableCell className="text-right">
                          {data.count}
                        </TableCell>
                        <TableCell className="text-right">
                          {data.amount.toLocaleString('nb-NO', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          {data.currency}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-slate-500 py-8">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Top Clients</CardTitle>
            <CardDescription>By total revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {topClients.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Invoices</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topClients.map(([name, data]) => (
                    <TableRow key={name}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell className="text-right">{data.count}</TableCell>
                      <TableCell className="text-right">
                        {data.amount.toLocaleString('nb-NO', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        {data.currency}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-slate-500 py-8">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
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
                    const isOverdue =
                      dueDate < today && invoice.status !== 'paid'
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
                          {invoice.amount.toLocaleString('nb-NO', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          {invoice.currency}
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
    </div>
  )
}
