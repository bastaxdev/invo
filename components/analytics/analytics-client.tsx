// components/analytics/analytics-client-refactored.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CurrencySelector } from './currency-selector'
import { useAnalyticsStats } from './hooks/use-analytics-stats'
import { AnalyticsStatCards } from './analytics-stat-cards'
import { AnalyticsTables } from './analytics-tables'

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

  // Use extracted analytics calculation hook
  const { stats, isLoading } = useAnalyticsStats(invoices, displayCurrency)

  const handleCurrencyChange = (currency: string) => {
    setDisplayCurrency(currency)
    router.push(`/dashboard/analytics?currency=${currency}`)
  }

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

      {/* Stat Cards */}
      <AnalyticsStatCards
        stats={stats}
        displayCurrency={displayCurrency}
        isLoading={isLoading}
      />

      {/* Tables */}
      <AnalyticsTables
        monthlyData={stats.monthlyData}
        topClients={stats.topClients}
        displayCurrency={displayCurrency}
        isLoading={isLoading}
      />
    </>
  )
}
