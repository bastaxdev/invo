// components/analytics/analytics-client.tsx
'use client'

import { useState, useEffect } from 'react'
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
import { CurrencySelector } from './currency-selector'
import { useRouter } from 'next/navigation'
import { formatCurrency, convertCurrency, convertAndSum } from '@/lib/currency'

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

interface AnalyticsClientProps {
  invoices: Invoice[]
  defaultCurrency: string
  displayCurrency: string
}

export function AnalyticsClient({
  invoices,
  defaultCurrency,
  displayCurrency: initialCurrency,
}: AnalyticsClientProps) {
  const router = useRouter()
  const [displayCurrency, setDisplayCurrency] = useState(initialCurrency)
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    // Paid metrics
    paidNetSales: 0,
    paidVatCollected: 0,
    paidGrossSales: 0,
    paidCount: 0,

    // Outstanding metrics
    outstandingNetSales: 0,
    outstandingVat: 0,
    outstandingGrossSales: 0,
    outstandingCount: 0,

    // Total metrics
    totalNetSales: 0,
    totalVat: 0,
    totalGrossSales: 0,

    // Averages
    averageInvoiceNet: 0,
    averageInvoiceGross: 0,

    monthlyData: {} as Record<
      string,
      {
        count: number
        netAmount: number
        vatAmount: number
        grossAmount: number
      }
    >,
    topClients: [] as Array<
      [
        string,
        {
          count: number
          netAmount: number
          vatAmount: number
          grossAmount: number
        }
      ]
    >,
  })

  const handleCurrencyChange = (currency: string) => {
    setDisplayCurrency(currency)
    router.push(`/dashboard/analytics?currency=${currency}`)
  }

  useEffect(() => {
    async function calculateStats() {
      setIsLoading(true)

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Separate invoices by status
      const paidInvoices = invoices.filter((inv) => inv.status === 'paid')
      const sentInvoices = invoices.filter((inv) => {
        const dueDate = new Date(inv.due_date)
        dueDate.setHours(0, 0, 0, 0)
        return inv.status === 'sent' && dueDate >= today
      })
      const overdueInvoices = invoices.filter((inv) => {
        const dueDate = new Date(inv.due_date)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate < today && inv.status !== 'paid'
      })

      // Calculate PAID metrics
      const paidNetSales = await convertAndSum(
        paidInvoices.map((inv) => ({
          amount: inv.amount,
          currency: inv.currency,
        })),
        displayCurrency
      )

      const paidVatCollected = await convertAndSum(
        paidInvoices.map((inv) => ({
          amount: inv.vat_amount || 0,
          currency: inv.currency,
        })),
        displayCurrency
      )

      const paidGrossSales = await convertAndSum(
        paidInvoices.map((inv) => ({
          amount: inv.amount_with_vat || inv.amount,
          currency: inv.currency,
        })),
        displayCurrency
      )

      // Calculate OUTSTANDING metrics
      const outstandingInvoices = [...sentInvoices, ...overdueInvoices]
      const outstandingNetSales = await convertAndSum(
        outstandingInvoices.map((inv) => ({
          amount: inv.amount,
          currency: inv.currency,
        })),
        displayCurrency
      )

      const outstandingVat = await convertAndSum(
        outstandingInvoices.map((inv) => ({
          amount: inv.vat_amount || 0,
          currency: inv.currency,
        })),
        displayCurrency
      )

      const outstandingGrossSales = await convertAndSum(
        outstandingInvoices.map((inv) => ({
          amount: inv.amount_with_vat || inv.amount,
          currency: inv.currency,
        })),
        displayCurrency
      )

      // Calculate TOTAL metrics (non-draft)
      const nonDraftInvoices = invoices.filter((inv) => inv.status !== 'draft')
      const totalNetSales = await convertAndSum(
        nonDraftInvoices.map((inv) => ({
          amount: inv.amount,
          currency: inv.currency,
        })),
        displayCurrency
      )

      const totalVat = await convertAndSum(
        nonDraftInvoices.map((inv) => ({
          amount: inv.vat_amount || 0,
          currency: inv.currency,
        })),
        displayCurrency
      )

      const totalGrossSales = await convertAndSum(
        nonDraftInvoices.map((inv) => ({
          amount: inv.amount_with_vat || inv.amount,
          currency: inv.currency,
        })),
        displayCurrency
      )

      // Calculate averages
      const averageInvoiceNet =
        paidInvoices.length > 0 ? paidNetSales / paidInvoices.length : 0
      const averageInvoiceGross =
        paidInvoices.length > 0 ? paidGrossSales / paidInvoices.length : 0

      // Monthly breakdown (paid only)
      const monthlyData: Record<
        string,
        {
          count: number
          netAmount: number
          vatAmount: number
          grossAmount: number
        }
      > = {}

      for (const inv of paidInvoices) {
        const month = new Date(inv.issue_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
        })

        const convertedNet = await convertCurrency(
          inv.amount,
          inv.currency,
          displayCurrency
        )
        const convertedVat = await convertCurrency(
          inv.vat_amount || 0,
          inv.currency,
          displayCurrency
        )
        const convertedGross = await convertCurrency(
          inv.amount_with_vat || inv.amount,
          inv.currency,
          displayCurrency
        )

        if (!monthlyData[month]) {
          monthlyData[month] = {
            count: 0,
            netAmount: 0,
            vatAmount: 0,
            grossAmount: 0,
          }
        }
        monthlyData[month].count++
        monthlyData[month].netAmount += convertedNet
        monthlyData[month].vatAmount += convertedVat
        monthlyData[month].grossAmount += convertedGross
      }

      // Top clients (paid only)
      const clientData: Record<
        string,
        {
          count: number
          netAmount: number
          vatAmount: number
          grossAmount: number
        }
      > = {}

      for (const inv of paidInvoices) {
        const clientName = inv.clients?.name || 'Unknown'
        const convertedNet = await convertCurrency(
          inv.amount,
          inv.currency,
          displayCurrency
        )
        const convertedVat = await convertCurrency(
          inv.vat_amount || 0,
          inv.currency,
          displayCurrency
        )
        const convertedGross = await convertCurrency(
          inv.amount_with_vat || inv.amount,
          inv.currency,
          displayCurrency
        )

        if (!clientData[clientName]) {
          clientData[clientName] = {
            count: 0,
            netAmount: 0,
            vatAmount: 0,
            grossAmount: 0,
          }
        }
        clientData[clientName].count++
        clientData[clientName].netAmount += convertedNet
        clientData[clientName].vatAmount += convertedVat
        clientData[clientName].grossAmount += convertedGross
      }

      const topClients = Object.entries(clientData)
        .sort((a, b) => b[1].grossAmount - a[1].grossAmount)
        .slice(0, 5)

      setStats({
        paidNetSales,
        paidVatCollected,
        paidGrossSales,
        paidCount: paidInvoices.length,
        outstandingNetSales,
        outstandingVat,
        outstandingGrossSales,
        outstandingCount: outstandingInvoices.length,
        totalNetSales,
        totalVat,
        totalGrossSales,
        averageInvoiceNet,
        averageInvoiceGross,
        monthlyData,
        topClients,
      })

      setIsLoading(false)
    }

    calculateStats()
  }, [invoices, displayCurrency])

  return (
    <>
      {/* Currency Selector */}
      <div className="mb-6 flex justify-end">
        <CurrencySelector
          defaultCurrency={defaultCurrency}
          currentCurrency={displayCurrency}
          onCurrencyChange={handleCurrencyChange}
        />
      </div>

      {/* Financial Overview - Main Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardDescription className="text-green-700">
              Total Revenue (Paid)
            </CardDescription>
            <CardTitle className="text-2xl text-green-900">
              {isLoading ? (
                <span className="text-slate-400">Loading...</span>
              ) : (
                formatCurrency(stats.paidGrossSales, displayCurrency)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div className="flex justify-between text-green-700">
                <span>Net Sales:</span>
                <span className="font-semibold">
                  {formatCurrency(stats.paidNetSales, displayCurrency)}
                </span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>VAT Collected:</span>
                <span className="font-semibold">
                  {formatCurrency(stats.paidVatCollected, displayCurrency)}
                </span>
              </div>
              <p className="text-xs text-green-600 mt-2">
                {stats.paidCount} paid invoices
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardDescription className="text-blue-700">
              Outstanding Payments
            </CardDescription>
            <CardTitle className="text-2xl text-blue-900">
              {isLoading ? (
                <span className="text-slate-400">Loading...</span>
              ) : (
                formatCurrency(stats.outstandingGrossSales, displayCurrency)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div className="flex justify-between text-blue-700">
                <span>Net Amount:</span>
                <span className="font-semibold">
                  {formatCurrency(stats.outstandingNetSales, displayCurrency)}
                </span>
              </div>
              <div className="flex justify-between text-blue-600">
                <span>VAT Pending:</span>
                <span className="font-semibold">
                  {formatCurrency(stats.outstandingVat, displayCurrency)}
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                {stats.outstandingCount} unpaid invoices
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardDescription className="text-purple-700">
              Total VAT (All Time)
            </CardDescription>
            <CardTitle className="text-2xl text-purple-900">
              {isLoading ? (
                <span className="text-slate-400">Loading...</span>
              ) : (
                formatCurrency(stats.totalVat, displayCurrency)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div className="flex justify-between text-purple-700">
                <span>Collected:</span>
                <span className="font-semibold">
                  {formatCurrency(stats.paidVatCollected, displayCurrency)}
                </span>
              </div>
              <div className="flex justify-between text-purple-600">
                <span>Pending:</span>
                <span className="font-semibold">
                  {formatCurrency(stats.outstandingVat, displayCurrency)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <CardDescription className="text-slate-700">
              Average Invoice (Paid)
            </CardDescription>
            <CardTitle className="text-2xl text-slate-900">
              {isLoading ? (
                <span className="text-slate-400">Loading...</span>
              ) : (
                formatCurrency(stats.averageInvoiceGross, displayCurrency)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div className="flex justify-between text-slate-700">
                <span>Net Average:</span>
                <span className="font-semibold">
                  {formatCurrency(stats.averageInvoiceNet, displayCurrency)}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Based on {stats.paidCount} paid invoices
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Sales Summary */}
      <Card className="mb-8 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300">
        <CardHeader>
          <CardTitle className="text-slate-900">
            Total Sales Summary (All Non-Draft Invoices)
          </CardTitle>
          <CardDescription>
            Complete financial overview in {displayCurrency}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-sm text-slate-600 mb-1">Gross Sales</div>
              <div className="text-2xl font-bold text-slate-900">
                {isLoading
                  ? '...'
                  : formatCurrency(stats.totalGrossSales, displayCurrency)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-600 mb-1">Net Sales</div>
              <div className="text-2xl font-bold text-slate-900">
                {isLoading
                  ? '...'
                  : formatCurrency(stats.totalNetSales, displayCurrency)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-600 mb-1">Total VAT</div>
              <div className="text-2xl font-bold text-slate-900">
                {isLoading
                  ? '...'
                  : formatCurrency(stats.totalVat, displayCurrency)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Monthly Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Breakdown</CardTitle>
            <CardDescription>
              Paid invoices per month in {displayCurrency}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.monthlyData).length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                    <TableHead className="text-right">VAT</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(stats.monthlyData)
                    .slice(0, 6)
                    .map(([month, data]) => (
                      <TableRow key={month}>
                        <TableCell className="font-medium">{month}</TableCell>
                        <TableCell className="text-right">
                          {data.count}
                        </TableCell>
                        <TableCell className="text-right">
                          {isLoading
                            ? '...'
                            : formatCurrency(data.netAmount, displayCurrency)}
                        </TableCell>
                        <TableCell className="text-right text-slate-600">
                          {isLoading
                            ? '...'
                            : formatCurrency(data.vatAmount, displayCurrency)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {isLoading
                            ? '...'
                            : formatCurrency(data.grossAmount, displayCurrency)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-slate-500 py-8">
                No paid invoices yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Top Clients</CardTitle>
            <CardDescription>
              By paid revenue in {displayCurrency}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topClients.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Invoices</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topClients.map(([name, data]) => (
                    <TableRow key={name}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell className="text-right">{data.count}</TableCell>
                      <TableCell className="text-right">
                        {isLoading
                          ? '...'
                          : formatCurrency(data.netAmount, displayCurrency)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {isLoading
                          ? '...'
                          : formatCurrency(data.grossAmount, displayCurrency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-slate-500 py-8">
                No paid invoices yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
