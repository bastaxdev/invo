// app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  getOverdueInvoices,
  shouldShowOverdueCheck,
} from '@/app/actions/invoices'
import {
  calculateLast12MonthsRevenueNOK,
  shouldShowMVAPopup,
} from '@/app/actions/mva'
import { OverdueInvoiceDialog } from '@/components/invoices/overdue-invoice-dialog'
import { MVAProgressBar } from '@/components/dashboard/mva-progress-bar'
import { MVARegistrationPopup } from '@/components/dashboard/mva-registration-popup'
import { StatusBadge } from '@/components/invoices/status-badge'
import { convertAndSum } from '@/lib/currency'
import { TrendingUp, Clock, AlertCircle, FileText, Plus, Users } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [
    { data: invoices },
    { data: profile },
    { data: clients },
  ] = await Promise.all([
    supabase
      .from('invoices')
      .select('*, clients(name)')
      .order('created_at', { ascending: false }),
    supabase
      .from('user_profiles')
      .select('mva_registered, full_name, business_name, default_currency')
      .eq('user_id', user.id)
      .single(),
    supabase.from('clients').select('id'),
  ])

  const defaultCurrency = profile?.default_currency || 'PLN'
  const allInvoices = invoices || []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const paidInvoices = allInvoices.filter((inv) => inv.status === 'paid')
  const sentInvoices = allInvoices.filter((inv) => {
    const due = new Date(inv.due_date)
    due.setHours(0, 0, 0, 0)
    return inv.status === 'sent' && due >= today
  })
  const overdueList = allInvoices.filter((inv) => {
    const due = new Date(inv.due_date)
    due.setHours(0, 0, 0, 0)
    return due < today && inv.status !== 'paid' && inv.status !== 'draft'
  })

  const [paidRevenue, outstanding, overdueAmount] = await Promise.all([
    convertAndSum(
      paidInvoices.map((inv) => ({
        amount: inv.amount_with_vat || inv.amount,
        currency: inv.currency,
      })),
      defaultCurrency
    ),
    convertAndSum(
      [...sentInvoices, ...overdueList].map((inv) => ({
        amount: inv.amount_with_vat || inv.amount,
        currency: inv.currency,
      })),
      defaultCurrency
    ),
    convertAndSum(
      overdueList.map((inv) => ({
        amount: inv.amount_with_vat || inv.amount,
        currency: inv.currency,
      })),
      defaultCurrency
    ),
  ])

  const fmt = (amount: number) =>
    amount.toLocaleString('nb-NO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })

  const showOverdueCheck = await shouldShowOverdueCheck()
  const overdueInvoices = showOverdueCheck ? await getOverdueInvoices() : []
  const revenueNOK = await calculateLast12MonthsRevenueNOK()
  const showMVAPopup = await shouldShowMVAPopup()

  const displayName = profile?.business_name || profile?.full_name || user.email
  const recentInvoices = allInvoices.slice(0, 6)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {overdueInvoices.length > 0 && (
        <OverdueInvoiceDialog invoices={overdueInvoices} open={true} />
      )}
      {showMVAPopup && (
        <MVARegistrationPopup revenueNOK={revenueNOK} open={true} />
      )}

      {/* Header */}
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">
            Welcome back, {displayName}
          </p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      {/* MVA Progress Bar */}
      {!profile?.mva_registered && (
        <div className="mb-6">
          <MVAProgressBar revenueNOK={revenueNOK} mvaRegistered={false} />
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue Earned
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fmt(paidRevenue)} {defaultCurrency}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {paidInvoices.length} paid invoice{paidInvoices.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fmt(outstanding)} {defaultCurrency}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {sentInvoices.length + overdueList.length} unpaid invoice{sentInvoices.length + overdueList.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overdueList.length > 0 ? 'text-destructive' : ''}`}>
              {fmt(overdueAmount)} {defaultCurrency}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {overdueList.length} overdue invoice{overdueList.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              All Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allInvoices.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {clients?.length || 0} client{clients?.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Recent Invoices */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Recent Invoices</h2>
            <Link href="/dashboard/invoices">
              <Button variant="ghost" size="sm" className="text-xs">
                View all
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="p-0">
              {recentInvoices.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No invoices yet.{' '}
                  <Link href="/dashboard/invoices/new" className="underline">
                    Create your first one.
                  </Link>
                </div>
              ) : (
                <div className="divide-y">
                  {recentInvoices.map((inv) => (
                    <Link
                      key={inv.id}
                      href={`/dashboard/invoices/${inv.id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {inv.invoice_number}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {(inv.clients as { name: string } | null)?.name || '—'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-4 shrink-0">
                        <span className="text-sm font-medium tabular-nums">
                          {(inv.amount_with_vat || inv.amount).toLocaleString('nb-NO', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}{' '}
                          {inv.currency}
                        </span>
                        <StatusBadge status={inv.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-base font-semibold mb-3">Quick Actions</h2>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard/invoices/new">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                New Invoice
              </Button>
            </Link>
            <Link href="/dashboard/clients/new">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                New Client
              </Button>
            </Link>
            <Link href="/dashboard/invoices">
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileText className="h-4 w-4" />
                All Invoices
              </Button>
            </Link>
            <Link href="/dashboard/analytics">
              <Button variant="outline" className="w-full justify-start gap-2">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
