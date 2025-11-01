// components/invoices/generate-pdf-button.tsx
'use client'

import { Button } from '@/components/ui/button'
import { InvoicePDF } from './invoice-pdf'
import { pdf } from '@react-pdf/renderer'
import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface InvoiceItem {
  description: string
  quantity: number
  unit_price: number
  amount: number
}

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
  invoiceItems?: InvoiceItem[]
  user: User
  userProfile?: {
    full_name: string | null
    business_name: string | null
    tax_id: string | null
    address: string | null
    phone: string | null
    bank_account: string | null
    bank_name: string | null
    bank_address: string | null
    swift_bic: string | null
    company_registration: string | null
    logo_url: string | null
    show_logo_on_invoice: boolean
  } | null
}

export function GeneratePDFButton({
  invoice,
  invoiceItems,
  user,
  userProfile,
}: GeneratePDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGeneratePDF = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const blob = await pdf(
        <InvoicePDF
          invoice={invoice}
          invoiceItems={invoiceItems}
          user={{ email: user.email || 'No email' }}
          userProfile={userProfile}
        />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Invoice_${invoice.invoice_number}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error generating PDF:', err)
      setError('Failed to generate PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <Button onClick={handleGeneratePDF} disabled={isGenerating} size="lg">
        {isGenerating ? 'Generating PDF...' : '📄 Generate PDF'}
      </Button>

      <AlertDialog open={!!error} onOpenChange={() => setError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>PDF Generation Failed</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setError(null)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
