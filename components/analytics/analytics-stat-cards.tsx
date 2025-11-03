// components/analytics/analytics-stat-cards.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatCurrency } from '@/lib/currency'

interface AnalyticsStatCardsProps {
  stats: {
    paidGrossSales: number
    paidNetSales: number
    paidVatCollected: number
    paidCount: number
    outstandingGrossSales: number
    outstandingNetSales: number
    outstandingVat: number
    outstandingCount: number
    totalVat: number
    averageInvoiceGross: number
    averageInvoiceNet: number
    totalGrossSales: number
    totalNetSales: number
  }
  displayCurrency: string
  isLoading: boolean
}

export function AnalyticsStatCards({
  stats,
  displayCurrency,
  isLoading,
}: AnalyticsStatCardsProps) {
  return (
    <>
      {/* Main Stat Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        {/* Paid Revenue Card */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardDescription className="text-green-700 text-xs sm:text-sm">
              Total Revenue (Paid)
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl text-green-900">
              {isLoading ? (
                <span className="text-slate-400">Loading...</span>
              ) : (
                formatCurrency(stats.paidGrossSales, displayCurrency)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs sm:text-sm space-y-1">
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

        {/* Outstanding Payments Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardDescription className="text-blue-700 text-xs sm:text-sm">
              Outstanding Payments
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl text-blue-900">
              {isLoading ? (
                <span className="text-slate-400">Loading...</span>
              ) : (
                formatCurrency(stats.outstandingGrossSales, displayCurrency)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs sm:text-sm space-y-1">
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

        {/* Total VAT Card */}
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardDescription className="text-purple-700 text-xs sm:text-sm">
              Total VAT (All Time)
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl text-purple-900">
              {isLoading ? (
                <span className="text-slate-400">Loading...</span>
              ) : (
                formatCurrency(stats.totalVat, displayCurrency)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs sm:text-sm space-y-1">
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

        {/* Average Invoice Card */}
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader className="pb-3">
            <CardDescription className="text-slate-700 text-xs sm:text-sm">
              Average Invoice (Paid)
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl text-slate-900">
              {isLoading ? (
                <span className="text-slate-400">Loading...</span>
              ) : (
                formatCurrency(stats.averageInvoiceGross, displayCurrency)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs sm:text-sm space-y-1">
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
      <Card className="mb-6 sm:mb-8 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-900 text-base sm:text-lg">
            Total Sales Summary (All Non-Draft Invoices)
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Complete financial overview in {displayCurrency}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            <div className="text-center">
              <div className="text-xs sm:text-sm text-slate-600 mb-1">
                Gross Sales
              </div>
              <div className="text-lg sm:text-2xl font-bold text-slate-900 break-words">
                {isLoading
                  ? '...'
                  : formatCurrency(stats.totalGrossSales, displayCurrency)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-slate-600 mb-1">
                Net Sales
              </div>
              <div className="text-lg sm:text-2xl font-bold text-slate-900 break-words">
                {isLoading
                  ? '...'
                  : formatCurrency(stats.totalNetSales, displayCurrency)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-slate-600 mb-1">
                Total VAT
              </div>
              <div className="text-lg sm:text-2xl font-bold text-slate-900 break-words">
                {isLoading
                  ? '...'
                  : formatCurrency(stats.totalVat, displayCurrency)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
