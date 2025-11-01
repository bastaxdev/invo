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
    totalRevenue: 0,
    expectedRevenue: 0,
    averageInvoice: 0,
    paidCount: 0,
    monthlyData: {} as Record<string, { count: number; amount: number }>,
    topClients: [] as Array<[string, { count: number; amount: number }]>,
  })

  const handleCurrencyChange = (currency: string) => {
    setDisplayCurrency(currency)
    router.push(`/dashboard/analytics?currency=${currency}`)
  }

  useEffect(() => {
    async function calculateStats() {
      setIsLoading(true)

      // Filter paid invoices
      const paidInvoices = invoices.filter((inv) => inv.status === 'paid')

      // Calculate total revenue (paid only)
      const totalRevenue = await convertAndSum(
        paidInvoices.map((inv) => ({
          amount: inv.amount,
          currency: inv.currency,
        })),
        displayCurrency
      )

      // Calculate expected revenue (all invoices)
      const expectedRevenue = await convertAndSum(
        invoices.map((inv) => ({ amount: inv.amount, currency: inv.currency })),
        displayCurrency
      )

      // Calculate average
      const averageInvoice =
        paidInvoices.length > 0 ? totalRevenue / paidInvoices.length : 0

      // Monthly breakdown (paid only)
      const monthlyData: Record<string, { count: number; amount: number }> = {}

      for (const inv of paidInvoices) {
        const month = new Date(inv.issue_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
        })

        const convertedAmount = await convertCurrency(
          inv.amount,
          inv.currency,
          displayCurrency
        )

        if (!monthlyData[month]) {
          monthlyData[month] = { count: 0, amount: 0 }
        }
        monthlyData[month].count++
        monthlyData[month].amount += convertedAmount
      }

      // Top clients (paid only)
      const clientData: Record<string, { count: number; amount: number }> = {}

      for (const inv of paidInvoices) {
        const clientName = inv.clients?.name || 'Unknown'
        const convertedAmount = await convertCurrency(
          inv.amount,
          inv.currency,
          displayCurrency
        )

        if (!clientData[clientName]) {
          clientData[clientName] = { count: 0, amount: 0 }
        }
        clientData[clientName].count++
        clientData[clientName].amount += convertedAmount
      }

      const topClients = Object.entries(clientData)
        .sort((a, b) => b[1].amount - a[1].amount)
        .slice(0, 5)

      setStats({
        totalRevenue,
        expectedRevenue,
        averageInvoice,
        paidCount: paidInvoices.length,
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

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardDescription>Total Revenue (Paid)</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? (
                <span className="text-slate-400">Loading...</span>
              ) : (
                <>
                  <div>
                    ≈{formatCurrency(stats.totalRevenue, displayCurrency)}
                  </div>
                  <div className="text-xs text-slate-400 font-normal mt-2">
                    Expected if all paid:{' '}
                    {formatCurrency(stats.expectedRevenue, displayCurrency)}
                  </div>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              {stats.paidCount} of {invoices.length} invoices paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Average Invoice</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? (
                <span className="text-slate-400">Loading...</span>
              ) : (
                `≈${formatCurrency(stats.averageInvoice, displayCurrency)}`
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">Based on paid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Total Invoices</CardDescription>
            <CardTitle className="text-3xl">{invoices.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">All time</p>
          </CardContent>
        </Card>
      </div>

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
                    <TableHead className="text-right">Amount</TableHead>
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
                            : `≈${formatCurrency(
                                data.amount,
                                displayCurrency
                              )}`}
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
                    <TableHead className="text-right">Total</TableHead>
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
                          : `≈${formatCurrency(data.amount, displayCurrency)}`}
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
