// components/invoices/invoice-line-items.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Trash2, Plus } from 'lucide-react'

export interface InvoiceItem {
  id?: string
  description: string
  quantity: number
  unit_price: number
  amount: number
}

interface InvoiceLineItemsProps {
  items: InvoiceItem[]
  setItems: (items: InvoiceItem[]) => void
  currency: string
  subtotal: number
  vatAmount: number
  totalAmount: number
  shouldApplyVAT: boolean
  VAT_RATE: number
}

export function InvoiceLineItems({
  items,
  setItems,
  currency,
  subtotal,
  vatAmount,
  totalAmount,
  shouldApplyVAT,
  VAT_RATE,
}: InvoiceLineItemsProps) {
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

  return (
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
            <span className="font-medium">Norwegian MVA ({VAT_RATE}%):</span>
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
  )
}
