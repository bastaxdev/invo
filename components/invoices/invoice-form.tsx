// components/invoices/invoice-form.tsx
'use client'

import { useState } from 'react'
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
import Link from 'next/link'

interface Client {
  id: string
  name: string
  org_number: string
  address: string
}

interface InvoiceFormProps {
  clients: Client[]
  invoice?: {
    client_id: string
    invoice_number: string
    issue_date: string
    due_date: string
    description: string
    amount: number
    currency: string
  }
  action: (formData: FormData) => Promise<void>
}

export function InvoiceForm({ clients, invoice, action }: InvoiceFormProps) {
  const [useNewClient, setUseNewClient] = useState(false)
  const today = new Date().toISOString().split('T')[0]
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  return (
    <form action={action} className="space-y-6">
      {/* Client Selection */}
      <div className="space-y-4 rounded-lg border border-border p-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="use-new-client"
            checked={useNewClient}
            onCheckedChange={(checked) => setUseNewClient(checked === true)}
          />
          <label
            htmlFor="use-new-client"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
          >
            Create new client for this invoice
          </label>
        </div>

        {!useNewClient ? (
          <div className="space-y-2">
            <Label htmlFor="client_id" className="text-foreground">
              Select Existing Client
            </Label>
            <Select
              name="client_id"
              defaultValue={invoice?.client_id}
              required={!useNewClient}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              New client will be created and saved to your clients list
            </p>
            <div className="space-y-2">
              <Label htmlFor="new_client_name" className="text-foreground">
                Client Name
              </Label>
              <Input
                id="new_client_name"
                name="new_client_name"
                type="text"
                placeholder="e.g., Acme AS"
                required={useNewClient}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="new_client_org_number"
                className="text-foreground"
              >
                Organization Number
              </Label>
              <Input
                id="new_client_org_number"
                name="new_client_org_number"
                type="text"
                placeholder="e.g., 123456789"
                required={useNewClient}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_client_address" className="text-foreground">
                Address
              </Label>
              <Input
                id="new_client_address"
                name="new_client_address"
                type="text"
                placeholder="e.g., Storgata 1, 0001 Oslo, Norway"
                required={useNewClient}
              />
            </div>
          </div>
        )}
      </div>

      {/* Invoice Details */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="invoice_number" className="text-foreground">
            Invoice Number
          </Label>
          <Input
            id="invoice_number"
            name="invoice_number"
            type="text"
            placeholder="e.g., INV-001"
            defaultValue={invoice?.invoice_number}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="issue_date" className="text-foreground">
              Issue Date
            </Label>
            <Input
              id="issue_date"
              name="issue_date"
              type="date"
              defaultValue={invoice?.issue_date || today}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="due_date" className="text-foreground">
              Due Date
            </Label>
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
          <Label htmlFor="description" className="text-foreground">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder="e.g., Web development services for January 2024"
            rows={3}
            defaultValue={invoice?.description}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-foreground">
              Amount
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              defaultValue={invoice?.amount}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency" className="text-foreground">
              Currency
            </Label>
            <Select
              name="currency"
              defaultValue={invoice?.currency || 'NOK'}
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
