// components/invoices/overdue-invoice-dialog.tsx
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
import { Checkbox } from '@/components/ui/checkbox'
import { X } from 'lucide-react'
import { markInvoiceAsPaid, dismissOverdueCheck } from '@/app/actions/invoices'
import { formatCurrency } from '@/lib/currency'

interface OverdueInvoice {
  id: string
  invoice_number: string
  due_date: string
  amount: number
  currency: string
  clients:
    | {
        name: string
      }
    | { name: string }[]
    | null
}

interface OverdueInvoiceDialogProps {
  invoices: OverdueInvoice[]
  open: boolean
}

export function OverdueInvoiceDialog({
  invoices,
  open: initialOpen,
}: OverdueInvoiceDialogProps) {
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(
    new Set()
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(initialOpen)

  const toggleInvoice = (invoiceId: string) => {
    const newSet = new Set(selectedInvoices)
    if (newSet.has(invoiceId)) {
      newSet.delete(invoiceId)
    } else {
      newSet.add(invoiceId)
    }
    setSelectedInvoices(newSet)
  }

  const handleConfirmPayments = async () => {
    setIsSubmitting(true)

    // Mark selected invoices as paid
    for (const invoiceId of selectedInvoices) {
      await markInvoiceAsPaid(invoiceId)
    }

    // Dismiss the check (since invoices are marked as paid)
    await dismissOverdueCheck()

    window.location.reload()
  }

  const handleRemindTomorrow = async () => {
    setIsSubmitting(true)
    // This dismisses for 24 hours
    await dismissOverdueCheck()
    window.location.reload()
  }

  const handleClose = () => {
    // Just close the dialog without dismissing
    // User will see it again on next page load
    setIsOpen(false)
  }

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = today.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="max-w-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Custom X button that only closes temporarily */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          disabled={isSubmitting}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader>
          <DialogTitle className="text-xl text-foreground">
            ⚠️ Overdue Invoice{invoices.length > 1 ? 's' : ''} Alert
          </DialogTitle>
          <DialogDescription>
            You have {invoices.length} invoice{invoices.length > 1 ? 's' : ''}{' '}
            past the due date. Have you received payment for any of these?
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-96 space-y-3 overflow-y-auto py-4">
          {invoices.map((invoice) => {
            const daysOverdue = getDaysOverdue(invoice.due_date)
            return (
              <div
                key={invoice.id}
                className="flex items-start space-x-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4"
              >
                <Checkbox
                  checked={selectedInvoices.has(invoice.id)}
                  onCheckedChange={() => toggleInvoice(invoice.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">
                        {invoice.invoice_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {Array.isArray(invoice.clients)
                          ? invoice.clients[0]?.name || 'No client'
                          : invoice.clients?.name || 'No client'}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs">
                    <span className="text-muted-foreground">
                      Due: {new Date(invoice.due_date).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {daysOverdue} day{daysOverdue > 1 ? 's' : ''} overdue
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleRemindTomorrow}
            disabled={isSubmitting}
          >
            Remind Me Tomorrow
          </Button>
          <Button
            onClick={handleConfirmPayments}
            disabled={selectedInvoices.size === 0 || isSubmitting}
          >
            {isSubmitting
              ? 'Processing...'
              : `Mark ${selectedInvoices.size || ''} as Paid`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
