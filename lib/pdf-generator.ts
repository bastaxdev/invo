// lib/pdf-generator.ts
import { pdf } from '@react-pdf/renderer'
import { InvoicePDF } from '@/components/invoices/invoice-pdf'
import { createElement } from 'react'

interface InvoiceItem {
  description: string
  quantity: number
  unit_price: number
  amount: number
}

interface InvoiceData {
  invoice_number: string
  issue_date: string
  due_date: string
  description: string
  amount: number
  currency: string
  mode?: string
  clients: {
    name: string
    org_number: string
    address: string
  } | null
}

interface UserProfile {
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
}

export async function generateInvoicePDF(
  invoice: InvoiceData,
  invoiceItems: InvoiceItem[] | undefined,
  userEmail: string,
  userProfile: UserProfile | null
): Promise<Buffer> {
  const element = createElement(InvoicePDF, {
    invoice,
    invoiceItems,
    user: { email: userEmail },
    userProfile,
  })

  const pdfBlob = await pdf(element as any).toBlob()

  const arrayBuffer = await pdfBlob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
