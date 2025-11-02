'use client'

import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface MiniMVAIndicatorProps {
  revenueNOK: number
  mvaRegistered: boolean
}

const MVA_LIMIT = 50000

export function MiniMVAIndicator({
  revenueNOK,
  mvaRegistered,
}: MiniMVAIndicatorProps) {
  const percentage = Math.min((revenueNOK / MVA_LIMIT) * 100, 100)
  const hasExceeded = revenueNOK >= MVA_LIMIT

  if (mvaRegistered) {
    return (
      <Link
        href="/dashboard"
        className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>MVA Registered</span>
      </Link>
    )
  }

  return (
    <Link
      href="/dashboard"
      className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        hasExceeded
          ? 'bg-red-50 text-red-700 hover:bg-red-100'
          : percentage >= 80
          ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <div className="relative h-1.5 w-12 overflow-hidden rounded-full bg-white/50">
          <div
            className={`h-full transition-all duration-300 ${
              hasExceeded
                ? 'bg-red-600'
                : percentage >= 80
                ? 'bg-orange-500'
                : 'bg-blue-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="whitespace-nowrap">MVA {percentage.toFixed(0)}%</span>
      </div>
    </Link>
  )
}
