// components/analytics/analytics-tables.tsx
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
import { formatCurrency } from '@/lib/currency'

interface AnalyticsTablesProps {
  monthlyData: Record<
    string,
    {
      count: number
      netAmount: number
      vatAmount: number
      grossAmount: number
    }
  >
  topClients: Array<
    [
      string,
      {
        count: number
        netAmount: number
        vatAmount: number
        grossAmount: number
      }
    ]
  >
  displayCurrency: string
  isLoading: boolean
}

export function AnalyticsTables({
  monthlyData,
  topClients,
  displayCurrency,
  isLoading,
}: AnalyticsTablesProps) {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 mb-6 sm:mb-8">
      {/* Monthly Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">
            Monthly Breakdown
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Paid invoices per month in {displayCurrency}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(monthlyData).length > 0 ? (
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Month</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">
                      Count
                    </TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">
                      Net
                    </TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">
                      VAT
                    </TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">
                      Gross
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(monthlyData)
                    .slice(0, 6)
                    .map(([month, data]) => (
                      <TableRow key={month}>
                        <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">
                          {month}
                        </TableCell>
                        <TableCell className="text-right text-xs sm:text-sm">
                          {data.count}
                        </TableCell>
                        <TableCell className="text-right text-xs sm:text-sm whitespace-nowrap">
                          {isLoading
                            ? '...'
                            : formatCurrency(data.netAmount, displayCurrency)}
                        </TableCell>
                        <TableCell className="text-right text-slate-600 text-xs sm:text-sm whitespace-nowrap">
                          {isLoading
                            ? '...'
                            : formatCurrency(data.vatAmount, displayCurrency)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-xs sm:text-sm whitespace-nowrap">
                          {isLoading
                            ? '...'
                            : formatCurrency(data.grossAmount, displayCurrency)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-slate-500 py-8 text-sm">
              No paid invoices yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top Clients */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Top Clients</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            By paid revenue in {displayCurrency}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topClients.length > 0 ? (
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Client</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">
                      Invoices
                    </TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">
                      Net
                    </TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">
                      Gross
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topClients.map(([name, data]) => (
                    <TableRow key={name}>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        {name}
                      </TableCell>
                      <TableCell className="text-right text-xs sm:text-sm">
                        {data.count}
                      </TableCell>
                      <TableCell className="text-right text-xs sm:text-sm whitespace-nowrap">
                        {isLoading
                          ? '...'
                          : formatCurrency(data.netAmount, displayCurrency)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-xs sm:text-sm whitespace-nowrap">
                        {isLoading
                          ? '...'
                          : formatCurrency(data.grossAmount, displayCurrency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-slate-500 py-8 text-sm">
              No paid invoices yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
