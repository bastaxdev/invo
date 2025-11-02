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
        className="max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertCircle
              className={
                hasExceeded ? 'h-6 w-6 text-red-600' : 'h-6 w-6 text-orange-600'
              }
            />
            {hasExceeded
              ? 'MVA Registration Required'
              : 'Approaching MVA Registration Limit'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {hasExceeded ? (
              <>
                Your revenue has <strong>exceeded 50,000 NOK</strong> in the
                last 12 months. You are legally required to register for
                Norwegian MVA (VAT).
              </>
            ) : (
              <>
                You have reached <strong>{percentage.toFixed(0)}%</strong> of
                the 50,000 NOK limit for mandatory MVA registration.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Last 12 months revenue:
              </span>
              <span className="text-lg font-bold text-slate-900">
                {revenueNOK.toLocaleString('nb-NO', {
                  minimumFractionDigits: 0,
                })}{' '}
                NOK
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Registration limit:
              </span>
              <span className="text-lg font-bold text-slate-900">
                50,000 NOK
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold text-blue-900">
              Need help with MVA registration?
            </h3>
            <p className="mb-3 text-sm text-blue-800">
              We partner with experienced tax consultants who specialize in
              helping Polish freelancers navigate Norwegian MVA requirements.
            </p>
            <a
              href="mailto:tax@invo.app?subject=MVA Registration Assistance"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact tax consultant
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="mb-2">
              <strong>What happens when you register for MVA?</strong>
            </p>
            <ul className="ml-4 space-y-1 list-disc">
              <li>
                You must charge 25% VAT on invoices to Norwegian customers
              </li>
              <li>You can deduct VAT on business expenses in Norway</li>
              <li>
                You must file periodic MVA returns with Norwegian tax
                authorities
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Close
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            disabled={isSubmitting}
          >
            Remind Me Tomorrow
          </Button>
          <Button onClick={handleAlreadyRegistered} disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : "I'm Already Registered"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
