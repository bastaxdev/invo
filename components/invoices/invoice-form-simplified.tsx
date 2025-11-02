// components/invoices/invoice-form-simplified.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Trash2, Plus, AlertCircle } from 'lucide-react'

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

interface InvoiceItem {
  id?: string
  description: string
  quantity: number
  unit_price: number
  amount: number
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

  const today = new Date().toISOString().split('T')[0]
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  // Calculate VAT based on CORRECT Norwegian MVA law
  const selectedClient = clients.find((c) => c.id === selectedClientId)
  const clientCountry = useNewClient
    ? newClientCountry
    : selectedClient?.country || 'NO'

  // STEP 1: Determine if VAT should be applied
  let shouldApplyVAT = false
  let vatNoticeType = ''
  let showThresholdAlert = false

  if (mvaRegistered) {
    // USER IS REGISTERED - always charge VAT to Norwegian clients
    if (clientCountry === 'NO') {
      shouldApplyVAT = true
      vatNoticeType = 'registered_charging_vat'
    } else {
      // Export: 0% VAT
      shouldApplyVAT = false
      vatNoticeType = 'export'
    }
  } else {
    // USER IS NOT REGISTERED - check threshold
    if (revenueExceeded) {
      // Crossed threshold - MUST charge VAT and show alert
      if (clientCountry === 'NO') {
        shouldApplyVAT = true
        vatNoticeType = 'not_registered_crossed_threshold'
        showThresholdAlert = true
      }
    } else {
      // Under threshold - no VAT
      shouldApplyVAT = false
      vatNoticeType = 'under_threshold'
    }
  }

  const VAT_RATE = 25

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const vatAmount = shouldApplyVAT ? (subtotal * VAT_RATE) / 100 : 0
  const totalAmount = subtotal + vatAmount

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

  const addItem = () => {
    setItems([
      ...items,
      { description: '', quantity: 1, unit_price: 0, amount: 0 },
    ])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].amount =
        newItems[index].quantity * newItems[index].unit_price
    }

    setItems(newItems)
  }

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

      {/* Threshold Crossed Alert */}
      {showThresholdAlert && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">
                ⚠️ CRITICAL: MVA Registration Required
              </h3>
              <p className="text-sm text-red-800 mt-1">
                You have crossed the NOK 50,000 MVA threshold. You are{' '}
                <strong>legally required</strong> to register for MVA
                immediately. This invoice will include 25% VAT and will show:
                "Selskapet er under registrering i Merverdiavgiftsregisteret."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VAT Info Banner - Registered */}
      {mvaRegistered && shouldApplyVAT && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">
                25% Norwegian MVA will be applied
              </h3>
              <p className="text-sm text-green-800 mt-1">
                You are registered for MVA. Norwegian VAT will automatically be
                added to this invoice for Norwegian clients.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Export Banner */}
      {mvaRegistered && !shouldApplyVAT && clientCountry !== 'NO' && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Export - 0% VAT</h3>
              <p className="text-sm text-blue-800 mt-1">
                This is an export sale (non-Norwegian client). VAT rate: 0%
                (zero-rated export).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Client Selection */}
      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="use-new-client"
            checked={useNewClient}
            onCheckedChange={(checked) => setUseNewClient(checked === true)}
            disabled={!!invoice}
          />
          <label
            htmlFor="use-new-client"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Create new client for this invoice
          </label>
        </div>

        {!useNewClient ? (
          <div className="space-y-2">
            <Label htmlFor="client_id">Select Client</Label>
            <Select
              name="client_id"
              value={selectedClientId}
              onValueChange={setSelectedClientId}
              required={!useNewClient}
              disabled={!!invoice}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} ({client.country || 'NO'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {invoice && (
              <p className="text-xs text-slate-500">
                Client cannot be changed when editing.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_client_name">Client Name</Label>
              <Input
                id="new_client_name"
                name="new_client_name"
                type="text"
                placeholder="e.g., Acme AS"
                required={useNewClient}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_client_org_number">Organization Number</Label>
              <Input
                id="new_client_org_number"
                name="new_client_org_number"
                type="text"
                placeholder="e.g., 123456789"
                required={useNewClient}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_client_address">Address</Label>
              <Input
                id="new_client_address"
                name="new_client_address"
                type="text"
                placeholder="e.g., Storgata 1, 0001 Oslo, Norway"
                required={useNewClient}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_client_country">Country</Label>
              <Select
                name="new_client_country"
                value={newClientCountry}
                onValueChange={setNewClientCountry}
                required={useNewClient}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NO">🇳🇴 Norway</SelectItem>
                  <SelectItem value="PL">🇵🇱 Poland</SelectItem>
                  <SelectItem value="SE">🇸🇪 Sweden</SelectItem>
                  <SelectItem value="DK">🇩🇰 Denmark</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                VAT is only applied to Norwegian clients when you're MVA
                registered
              </p>
            </div>
          </div>
        )}
      </div>

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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Line Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {items.map((item, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, 'description', e.target.value)
                  }
                  placeholder="e.g., Web development services"
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        index,
                        'quantity',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unit_price}
                    onChange={(e) =>
                      updateItem(
                        index,
                        'unit_price',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={item.amount.toFixed(2)}
                    disabled
                    className="bg-slate-50"
                  />
                </div>
              </div>

              {items.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>
          </Card>
        ))}

        {/* Totals */}
        <div className="rounded-lg border bg-slate-50 p-4 space-y-2">
          <div className="flex justify-between text-base">
            <span className="font-medium">Subtotal:</span>
            <span>
              {subtotal.toFixed(2)} {currency}
            </span>
          </div>

          {shouldApplyVAT && (
            <div className="flex justify-between text-base text-green-700">
              <span className="font-medium">Norwegian MVA (25%):</span>
              <span>
                {vatAmount.toFixed(2)} {currency}
              </span>
            </div>
          )}

          <div className="border-t pt-2 flex justify-between text-lg font-bold">
            <span>Total Amount:</span>
            <span>
              {totalAmount.toFixed(2)} {currency}
            </span>
          </div>
        </div>
      </div>

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
