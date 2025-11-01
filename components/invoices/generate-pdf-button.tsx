// components/invoices/generate-pdf-button.tsx
'use client'

import { Button } from '@/components/ui/button'
import { InvoicePDF } from './invoice-pdf'
import { pdf } from '@react-pdf/renderer'
import { useState } from 'react'
import type { User } from '@supabase/supabase-js'

interface GeneratePDFButtonProps {
  invoice: {
    invoice_number: string
    issue_date: string
    due_date: string
    description: string
    amount: number
    currency: string
    clients: {
      name: string
      org_number: string
      address: string
    } | null
  }
  user: User
}

export function GeneratePDFButton({ invoice, user }: GeneratePDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGeneratePDF = async () => {
    setIsGenerating(true)
    try {
      const blob = await pdf(
        <InvoicePDF
          invoice={invoice}
          user={{ email: user.email || 'No email' }}
        />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Invoice_${invoice.invoice_number}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={handleGeneratePDF} disabled={isGenerating} size="lg">
      {isGenerating ? 'Generating PDF...' : '📄 Generate PDF'}
    </Button>
  )
}
