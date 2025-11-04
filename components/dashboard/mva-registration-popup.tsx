'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, ExternalLink } from 'lucide-react'
import { dismissMVAPopup, updateMVARegistrationStatus } from '@/app/actions/mva'

interface MVARegistrationPopupProps {
  revenueNOK: number
  open: boolean
}

export function MVARegistrationPopup({
  revenueNOK,
  open: initialOpen,
}: MVARegistrationPopupProps) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasExceeded = revenueNOK >= 50000
  const percentage = Math.min((revenueNOK / 50000) * 100, 100)

  const handleDismiss = async () => {
    setIsSubmitting(true)
    await dismissMVAPopup()
    setIsOpen(false)
    setIsSubmitting(false)
  }

  const handleAlreadyRegistered = async () => {
    setIsSubmitting(true)
    await updateMVARegistrationStatus(true)
    window.location.reload()
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="max-w-md max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg text-foreground">
            <AlertCircle
              className={
                hasExceeded
                  ? 'h-5 w-5 text-red-600 dark:text-red-400'
                  : 'h-5 w-5 text-orange-600 dark:text-orange-400'
              }
            />
            {hasExceeded
              ? 'MVA Registration Required'
              : 'Approaching MVA Limit'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {hasExceeded ? (
              <>
                Revenue exceeded{' '}
                <strong className="text-foreground">50,000 NOK</strong>.
                Registration is legally required.
              </>
            ) : (
              <>
                You've reached{' '}
                <strong className="text-foreground">
                  {percentage.toFixed(0)}%
                </strong>{' '}
                of the 50,000 NOK registration limit.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Compact revenue display */}
          <div className="flex items-center justify-between rounded-lg bg-muted border border-border px-3 py-2">
            <div>
              <div className="text-xs text-muted-foreground">
                Your revenue (12mo)
              </div>
              <div className="text-lg font-bold text-foreground">
                {revenueNOK.toLocaleString('nb-NO', {
                  minimumFractionDigits: 0,
                })}{' '}
                NOK
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Limit</div>
              <div className="text-lg font-bold text-foreground">50,000</div>
            </div>
          </div>

          {/* Compact help section */}
          <details className="group rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
            <summary className="cursor-pointer list-none p-3 font-semibold text-blue-900 dark:text-blue-200 text-sm flex items-center justify-between">
              <span>Need help with registration?</span>
              <span className="text-xs text-blue-600 dark:text-blue-400 group-open:hidden">
                Click to expand
              </span>
            </summary>
            <div className="px-3 pb-3 space-y-2">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                We partner with tax consultants specializing in Norwegian MVA
                for Polish freelancers.
              </p>
              <a
                href="mailto:tax@invo.app?subject=MVA Registration Assistance"
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contact consultant
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </details>

          {/* Compact info section */}
          <details className="group rounded-lg border border-border bg-muted">
            <summary className="cursor-pointer list-none p-3 font-semibold text-foreground text-sm flex items-center justify-between">
              <span>What happens when you register?</span>
              <span className="text-xs text-muted-foreground group-open:hidden">
                Click to expand
              </span>
            </summary>
            <ul className="px-3 pb-3 ml-4 space-y-1 list-disc text-xs text-muted-foreground">
              <li>Charge 25% VAT to Norwegian customers</li>
              <li>Deduct VAT on Norwegian business expenses</li>
              <li>File periodic MVA returns</li>
            </ul>
          </details>
        </div>

        <DialogFooter className="gap-2 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={handleDismiss}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Remind Tomorrow
          </Button>
          <Button
            onClick={handleAlreadyRegistered}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Processing...' : "I'm Registered"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
