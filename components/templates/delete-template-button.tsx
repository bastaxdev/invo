// components/templates/delete-template-button.tsx
'use client'

import { deleteTemplate } from '@/app/actions/templates'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function DeleteTemplateButton({
  id,
  name,
}: {
  id: string
  name: string
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete template "${name}"?`)) {
      return
    }

    setIsDeleting(true)
    await deleteTemplate(id)
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
