// components/invoices/delete-invoice-button.tsx
'use client'

import { deleteInvoice } from '@/app/actions/invoices'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useState } from 'react'

export function DeleteInvoiceButton({
  id,
  invoiceNumber,
}: {
  id: string
  invoiceNumber: string
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setShowConfirm(false)
    setIsDeleting(true)
    await deleteInvoice(id)
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </Button>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Delete Invoice"
        description={`Are you sure you want to delete invoice "${invoiceNumber}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  )
}
