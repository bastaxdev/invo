import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: clients } = await supabase.from('clients').select('*')

  const { data: invoices } = await supabase.from('invoices').select('*')

  const { data: templates } = await supabase
    .from('invoice_templates')
    .select('*')

  const totalRevenue = invoices?.reduce((sum, inv) => sum + inv.amount, 0) || 0

  // Check for overdue invoices
  const showOverdueCheck = await shouldShowOverdueCheck()
  const overdueInvoices = showOverdueCheck ? await getOverdueInvoices() : []

  // MVA tracking
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('mva_registered, full_name, business_name')
    .eq('user_id', user.id)
    .single()

  const revenueNOK = await calculateLast12MonthsRevenueNOK()
  const showMVAPopup = await shouldShowMVAPopup()

  // Determine display name logic:
  // 1. If business_name exists, use it (company takes priority)
  // 2. Else if full_name exists, use it
  // 3. Else use email (for newly registered users who haven't completed profile)
  const displayName = profile?.business_name || profile?.full_name || user.email

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Overdue Invoice Dialog */}
      {overdueInvoices.length > 0 && (
        <OverdueInvoiceDialog invoices={overdueInvoices} open={true} />
      )}

      {/* MVA Registration Popup */}
      {showMVAPopup && (
        <MVARegistrationPopup revenueNOK={revenueNOK} open={true} />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">Welcome back, {displayName}</p>
      </div>

      {/* MVA Progress Bar - only show if not registered */}
      {!profile?.mva_registered && (
        <div className="mb-6">
          <MVAProgressBar revenueNOK={revenueNOK} mvaRegistered={false} />
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
            <CardDescription>
              {clients?.length || 0} Norwegian client
              {clients?.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/clients">
              <Button className="w-full">Manage Clients</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>
              {invoices?.length || 0} invoice{invoices?.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/invoices">
              <Button className="w-full">Manage Invoices</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
            <CardDescription>
              {templates?.length || 0} template
              {templates?.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/templates">
              <Button className="w-full">Manage Templates</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>
              Total:{' '}
              {totalRevenue.toLocaleString('nb-NO', {
                minimumFractionDigits: 2,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/analytics">
              <Button className="w-full">View Analytics</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
