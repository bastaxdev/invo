// components/invoices/invoice-form-simplified-refactored.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { useVATCalculation } from './hooks/use-vat-calculation'
import { VATAlertBanners } from './vat-alert-banners'
import { ClientSelection } from './client-selection'
import { InvoiceLineItems, InvoiceItem } from './invoice-line-items'

interface Client {
  id: string
  name: string
  org_number: string
  address: string
  country?: string
}

interface Template {
  id: string
  name: string
  currency: string
  default_due_days: number
}

interface InvoiceFormProps {
  clients: Client[]
  templates?: Template[]
  invoice?: {
    id?: string
    client_id: string
    invoice_number: string
    issue_date: string
    due_date: string
    description: string
    amount: number
    currency: string
  }
  invoiceItems?: InvoiceItem[]
  action: (formData: FormData) => Promise<void>
  mvaRegistered: boolean
  revenueExceeded: boolean
}

export function InvoiceFormSimplified({
  clients,
  templates,
  invoice,
  invoiceItems,
  action,
  mvaRegistered,
  revenueExceeded,
}: InvoiceFormProps) {
  // State management
  const [useNewClient, setUseNewClient] = useState(false)
  const [currency, setCurrency] = useState(invoice?.currency || 'NOK')
  const [selectedClientId, setSelectedClientId] = useState(
    invoice?.client_id || ''
  )
  const [newClientCountry, setNewClientCountry] = useState('NO')
  const [items, setItems] = useState<InvoiceItem[]>(
    invoiceItems && invoiceItems.length > 0
      ? invoiceItems
      : invoice
      ? [
          {
            description: invoice.description,
            quantity: 1,
            unit_price: invoice.amount,
            amount: invoice.amount,
          },
        ]
      : [{ description: '', quantity: 1, unit_price: 0, amount: 0 }]
  )

  // Date defaults
  const today = new Date().toISOString().split('T')[0]
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  // Determine client country
  const selectedClient = clients.find((c) => c.id === selectedClientId)
  const clientCountry = useNewClient
    ? newClientCountry
    : selectedClient?.country || 'NO'

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)

  // Calculate VAT using extracted hook
  const {
    shouldApplyVAT,
    vatNoticeType,
    showThresholdAlert,
    VAT_RATE,
    vatAmount,
    totalAmount,
  } = useVATCalculation({
    mvaRegistered,
    revenueExceeded,
    clientCountry,
    subtotal,
  })

  // Template loading
  const loadTemplate = async (templateId: string) => {
    if (!templateId) return

    try {
      const response = await fetch(`/api/templates/${templateId}`)
      const data = await response.json()

      if (data.template && data.items) {
        setCurrency(data.template.currency)

        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + data.template.default_due_days)

        const dueDateInput = document.getElementById(
          'due_date'
        ) as HTMLInputElement
        if (dueDateInput) {
          dueDateInput.value = dueDate.toISOString().split('T')[0]
        }

        const loadedItems = data.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.quantity * item.unit_price,
        }))
        setItems(loadedItems)
      }
    } catch (error) {
      console.error('Error loading template:', error)
    }
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    formData.set('items', JSON.stringify(items))
    formData.set('amount', subtotal.toString())
    formData.set(
      'description',
      items.map((item) => item.description).join('; ')
    )

    await action(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Template Selection */}
      {templates && templates.length > 0 && !invoice && (
        <div className="rounded-lg border bg-blue-50 p-4">
          <Label htmlFor="template_id">Load from Template (Optional)</Label>
          <Select onValueChange={loadTemplate}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select a template to pre-fill" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-2 text-xs text-slate-600">
            Loading a template will pre-fill currency, due date, and line items
          </p>
        </div>
      )}

      {/* VAT Alert Banners */}
      <VATAlertBanners
        showThresholdAlert={showThresholdAlert}
        mvaRegistered={mvaRegistered}
        shouldApplyVAT={shouldApplyVAT}
        clientCountry={clientCountry}
      />

      {/* Client Selection */}
      <ClientSelection
        clients={clients}
        useNewClient={useNewClient}
        setUseNewClient={setUseNewClient}
        selectedClientId={selectedClientId}
        setSelectedClientId={setSelectedClientId}
        newClientCountry={newClientCountry}
        setNewClientCountry={setNewClientCountry}
        isEditing={!!invoice}
      />

      {/* Invoice Details */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="invoice_number">Invoice Number</Label>
          <Input
            id="invoice_number"
            name="invoice_number"
            type="text"
            placeholder="Auto-generated with your unique prefix"
            defaultValue={invoice?.invoice_number}
          />
          <p className="text-xs text-slate-500">Leave empty to auto-generate</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="issue_date">Issue Date</Label>
            <Input
              id="issue_date"
              name="issue_date"
              type="date"
              defaultValue={invoice?.issue_date || today}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              name="due_date"
              type="date"
              defaultValue={invoice?.due_date || nextMonth}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select
            name="currency"
            value={currency}
            onValueChange={setCurrency}
            required
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NOK">NOK (Norwegian Krone)</SelectItem>
              <SelectItem value="PLN">PLN (Polish Złoty)</SelectItem>
              <SelectItem value="EUR">EUR (Euro)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Line Items */}
      <InvoiceLineItems
        items={items}
        setItems={setItems}
        currency={currency}
        subtotal={subtotal}
        vatAmount={vatAmount}
        totalAmount={totalAmount}
        shouldApplyVAT={shouldApplyVAT}
        VAT_RATE={VAT_RATE}
      />

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <Button type="submit" className="flex-1">
          {invoice ? 'Update Invoice' : 'Create Invoice'}
        </Button>
        <Link href="/dashboard/invoices" className="flex-1">
          <Button type="button" variant="outline" className="w-full">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  )
}
