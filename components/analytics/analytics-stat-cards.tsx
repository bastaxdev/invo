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
      {/* Main Stat Cards - TONED DOWN, NO BRIGHT BACKGROUNDS */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        {/* Paid Revenue Card - Subtle green accent only */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardDescription className="text-muted-foreground text-xs sm:text-sm">
              Total Revenue (Paid)
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl text-foreground">
              {isLoading ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : (
                formatCurrency(stats.paidGrossSales, displayCurrency)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs sm:text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Net Sales:</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(stats.paidNetSales, displayCurrency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT Collected:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(stats.paidVatCollected, displayCurrency)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.paidCount} paid invoices
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Outstanding Payments Card - Subtle blue accent only */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardDescription className="text-muted-foreground text-xs sm:text-sm">
              Outstanding Payments
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl text-foreground">
              {isLoading ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : (
                formatCurrency(stats.outstandingGrossSales, displayCurrency)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs sm:text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Net Amount:</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(stats.outstandingNetSales, displayCurrency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT Pending:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {formatCurrency(stats.outstandingVat, displayCurrency)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.outstandingCount} unpaid invoices
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total VAT Card - Subtle purple accent only */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardDescription className="text-muted-foreground text-xs sm:text-sm">
              Total VAT (All Time)
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl text-foreground">
              {isLoading ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : (
                formatCurrency(stats.totalVat, displayCurrency)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs sm:text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Collected:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(stats.paidVatCollected, displayCurrency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {formatCurrency(stats.outstandingVat, displayCurrency)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Invoice Card - No color accent */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardDescription className="text-muted-foreground text-xs sm:text-sm">
              Average Invoice (Paid)
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl text-foreground">
              {isLoading ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : (
                formatCurrency(stats.averageInvoiceGross, displayCurrency)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs sm:text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Net Average:</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(stats.averageInvoiceNet, displayCurrency)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Based on {stats.paidCount} paid invoices
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Sales Summary - Clean, no gradient */}
      <Card className="mb-6 sm:mb-8 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground text-base sm:text-lg">
            Total Sales Summary (All Non-Draft Invoices)
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Complete financial overview in {displayCurrency}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            <div className="text-center">
              <div className="text-xs sm:text-sm text-muted-foreground mb-1">
                Gross Sales
              </div>
              <div className="text-lg sm:text-2xl font-bold text-foreground break-words">
                {isLoading
                  ? '...'
                  : formatCurrency(stats.totalGrossSales, displayCurrency)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-muted-foreground mb-1">
                Net Sales
              </div>
              <div className="text-lg sm:text-2xl font-bold text-foreground break-words">
                {isLoading
                  ? '...'
                  : formatCurrency(stats.totalNetSales, displayCurrency)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-muted-foreground mb-1">
                Total VAT
              </div>
              <div className="text-lg sm:text-2xl font-bold text-foreground break-words">
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
