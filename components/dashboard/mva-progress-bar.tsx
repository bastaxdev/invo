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
    <Card
      className={
        isApproachingLimit && !mvaRegistered
          ? 'border-orange-300 bg-orange-50'
          : ''
      }
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {mvaRegistered ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  MVA Status
                </>
              ) : (
                <>
                  {isApproachingLimit && (
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  )}
                  MVA Registration Tracker
                </>
              )}
            </CardTitle>
            <CardDescription>
              {mvaRegistered
                ? 'You are registered for Norwegian MVA'
                : hasExceeded
                ? 'You have exceeded the 50,000 NOK limit'
                : 'Norwegian VAT registration required at 50,000 NOK'}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">
              {revenueNOK.toLocaleString('nb-NO', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </div>
            <div className="text-sm text-slate-600">NOK (last 12 months)</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!mvaRegistered && (
          <>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-600">Progress to limit</span>
              <span className="font-semibold text-slate-900">
                {percentage.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full transition-all duration-500 ${
                  hasExceeded
                    ? 'bg-red-600'
                    : isApproachingLimit
                    ? 'bg-orange-500'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-slate-600">
              {hasExceeded ? (
                <span className="font-semibold text-red-600">
                  ⚠️ You must register for MVA immediately
                </span>
              ) : (
                <span>
                  {remaining.toLocaleString('nb-NO', {
                    minimumFractionDigits: 0,
                  })}{' '}
                  NOK remaining before registration required
                </span>
              )}
            </div>
          </>
        )}
        {mvaRegistered && (
          <div className="rounded-lg bg-green-100 p-3 text-sm text-green-800">
            ✓ You are compliant with Norwegian MVA regulations. Remember to
            charge 25% VAT on invoices to Norwegian customers.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
