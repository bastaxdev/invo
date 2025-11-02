// components/invoices/vat-alert-banners.tsx
import { AlertCircle } from 'lucide-react'

interface VATAlertBannersProps {
  showThresholdAlert: boolean
  mvaRegistered: boolean
  shouldApplyVAT: boolean
  clientCountry: string
}

export function VATAlertBanners({
  showThresholdAlert,
  mvaRegistered,
  shouldApplyVAT,
  clientCountry,
}: VATAlertBannersProps) {
  return (
    <>
      {/* Threshold Crossed Alert */}
      {showThresholdAlert && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">
                ⚠️ CRITICAL: MVA Registration Required
              </h3>
              <p className="text-sm text-red-800 mt-1">
                You have crossed the NOK 50,000 MVA threshold. You are{' '}
                <strong>legally required</strong> to register for MVA
                immediately. This invoice will include 25% VAT and will show:
                "Selskapet er under registrering i Merverdiavgiftsregisteret."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VAT Info Banner - Registered */}
      {mvaRegistered && shouldApplyVAT && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">
                25% Norwegian MVA will be applied
              </h3>
              <p className="text-sm text-green-800 mt-1">
                You are registered for MVA. Norwegian VAT will automatically be
                added to this invoice for Norwegian clients.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Export Banner */}
      {mvaRegistered && !shouldApplyVAT && clientCountry !== 'NO' && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Export - 0% VAT</h3>
              <p className="text-sm text-blue-800 mt-1">
                This is an export sale (non-Norwegian client). VAT rate: 0%
                (zero-rated export).
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
