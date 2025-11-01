// components/invoices/delete-invoice-button.tsx
'use client'

import { deleteInvoice } from '@/app/actions/invoices'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function DeleteInvoiceButton({
  id,
  invoiceNumber,
}: {
  id: string
  invoiceNumber: string
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (
      !confirm(`Are you sure you want to delete invoice "${invoiceNumber}"?`)
    ) {
      return
    }

    setIsDeleting(true)
    await deleteInvoice(id)
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </Button>
  )
}
