'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface MVAProgressBarProps {
  revenueNOK: number
  mvaRegistered: boolean
}

const MVA_LIMIT = 50000

export function MVAProgressBar({
  revenueNOK,
  mvaRegistered,
}: MVAProgressBarProps) {
  const percentage = Math.min((revenueNOK / MVA_LIMIT) * 100, 100)
  const remaining = Math.max(MVA_LIMIT - revenueNOK, 0)
  const isApproachingLimit = percentage >= 80
  const hasExceeded = revenueNOK >= MVA_LIMIT

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          {mvaRegistered ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              MVA Status
            </>
          ) : (
            <>
              {isApproachingLimit && (
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              )}
              MVA Registration Tracker
            </>
          )}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {mvaRegistered
            ? 'You are registered for Norwegian MVA'
            : hasExceeded
            ? 'You have exceeded the 50,000 NOK limit'
            : 'Norwegian VAT registration required at 50,000 NOK'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold text-foreground">
              {revenueNOK.toLocaleString('nb-NO', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </div>
            <div className="text-sm text-muted-foreground">
              NOK (last 12 months)
            </div>
          </div>
        </div>

        {!mvaRegistered && (
          <>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">
                Progress to limit
              </span>
              <span className="text-sm font-bold text-foreground">
                {percentage.toFixed(1)}%
              </span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full transition-all ${
                  hasExceeded
                    ? 'bg-red-600 dark:bg-red-500'
                    : isApproachingLimit
                    ? 'bg-orange-600 dark:bg-orange-500'
                    : 'bg-blue-600 dark:bg-blue-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              {hasExceeded ? (
                <span className="font-semibold text-red-600 dark:text-red-400">
                  ⚠️ You must register for MVA immediately
                </span>
              ) : (
                <>
                  {remaining.toLocaleString('nb-NO', {
                    minimumFractionDigits: 0,
                  })}{' '}
                  NOK remaining before registration required
                </>
              )}
            </p>
          </>
        )}

        {mvaRegistered && (
          <p className="text-sm text-muted-foreground">
            ✓ You are compliant with Norwegian MVA regulations. Remember to
            charge 25% VAT on invoices to Norwegian customers.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
