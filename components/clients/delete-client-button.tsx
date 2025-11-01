// components/clients/delete-client-button.tsx
'use client'

import { deleteClient } from '@/app/actions/clients'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function DeleteClientButton({ id, name }: { id: string; name: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    setIsDeleting(true)
    await deleteClient(id)
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
