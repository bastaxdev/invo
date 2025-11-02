// components/invoices/hooks/use-vat-calculation.ts
'use client'

import { useMemo } from 'react'

interface VATCalculationParams {
  mvaRegistered: boolean
  revenueExceeded: boolean
  clientCountry: string
  subtotal: number
}

interface VATCalculation {
  shouldApplyVAT: boolean
  vatNoticeType: string
  showThresholdAlert: boolean
  VAT_RATE: number
  vatAmount: number
  totalAmount: number
}

export function useVATCalculation({
  mvaRegistered,
  revenueExceeded,
  clientCountry,
  subtotal,
}: VATCalculationParams): VATCalculation {
  return useMemo(() => {
    const VAT_RATE = 25
    let shouldApplyVAT = false
    let vatNoticeType = ''
    let showThresholdAlert = false

    if (mvaRegistered) {
      // USER IS REGISTERED - always charge VAT to Norwegian clients
      if (clientCountry === 'NO') {
        shouldApplyVAT = true
        vatNoticeType = 'registered_charging_vat'
      } else {
        // Export: 0% VAT
        shouldApplyVAT = false
        vatNoticeType = 'export'
      }
    } else {
      // USER IS NOT REGISTERED - check threshold
      if (revenueExceeded) {
        // Crossed threshold - MUST charge VAT and show alert
        if (clientCountry === 'NO') {
          shouldApplyVAT = true
          vatNoticeType = 'not_registered_crossed_threshold'
          showThresholdAlert = true
        }
      } else {
        // Under threshold - no VAT
        shouldApplyVAT = false
        vatNoticeType = 'under_threshold'
      }
    }

    const vatAmount = shouldApplyVAT ? (subtotal * VAT_RATE) / 100 : 0
    const totalAmount = subtotal + vatAmount

    return {
      shouldApplyVAT,
      vatNoticeType,
      showThresholdAlert,
      VAT_RATE,
      vatAmount,
      totalAmount,
    }
  }, [mvaRegistered, revenueExceeded, clientCountry, subtotal])
}
