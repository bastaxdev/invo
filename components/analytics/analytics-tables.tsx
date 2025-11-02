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
          {Object.keys(monthlyData).length > 0 ? (
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
                {Object.entries(monthlyData)
                  .slice(0, 6)
                  .map(([month, data]) => (
                    <TableRow key={month}>
                      <TableCell className="font-medium">{month}</TableCell>
                      <TableCell className="text-right">{data.count}</TableCell>
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
          {topClients.length > 0 ? (
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
                {topClients.map(([name, data]) => (
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
  )
}
