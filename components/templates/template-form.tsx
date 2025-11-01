// components/templates/template-form.tsx
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
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Trash2, Plus } from 'lucide-react'

interface TemplateItem {
  description: string
  quantity: number
  unit_price: number
}

interface TemplateFormProps {
  template?: {
    name: string
    description: string | null
    currency: string
    default_due_days: number
    mode: string
    is_default: boolean
  }
  templateItems?: TemplateItem[]
  action: (formData: FormData) => Promise<void>
}

export function TemplateForm({
  template,
  templateItems,
  action,
}: TemplateFormProps) {
  const [mode, setMode] = useState<'simple' | 'advanced'>(
    (template?.mode as 'simple' | 'advanced') || 'simple'
  )
  const [items, setItems] = useState<TemplateItem[]>(
    templateItems && templateItems.length > 0
      ? templateItems
      : [{ description: '', quantity: 1, unit_price: 0 }]
  )
  const [isDefault, setIsDefault] = useState(template?.is_default || false)

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (
    index: number,
    field: keyof TemplateItem,
    value: string | number
  ) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    formData.set('mode', mode)
    formData.set('items', JSON.stringify(items))
    if (isDefault) {
      formData.set('is_default', 'on')
    }

    await action(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="e.g., Monthly Consulting"
            defaultValue={template?.name}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Template description..."
            rows={2}
            defaultValue={template?.description || ''}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              name="currency"
              defaultValue={template?.currency || 'NOK'}
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

          <div className="space-y-2">
            <Label htmlFor="default_due_days">Default Due Days</Label>
            <Input
              id="default_due_days"
              name="default_due_days"
              type="number"
              min="1"
              defaultValue={template?.default_due_days || 30}
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_default"
            checked={isDefault}
            onCheckedChange={(checked) => setIsDefault(checked === true)}
          />
          <label
            htmlFor="is_default"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Set as default template
          </label>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center justify-between rounded-lg border bg-slate-50 p-4">
        <div>
          <p className="font-medium">Template Mode</p>
          <p className="text-sm text-slate-600">
            {mode === 'simple'
              ? 'Simple: One line item'
              : 'Advanced: Multiple line items'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={mode === 'simple' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              if (mode === 'advanced' && items.length > 1) {
                if (
                  !confirm(
                    'Switching to simple mode will keep only the first item. Continue?'
                  )
                ) {
                  return
                }
                setItems([items[0]])
              }
              setMode('simple')
            }}
          >
            Simple
          </Button>
          <Button
            type="button"
            variant={mode === 'advanced' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('advanced')}
          >
            Advanced
          </Button>
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Template Line Items</Label>
          {mode === 'advanced' && (
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          )}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Quantity</Label>
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
                  <Label>Default Unit Price</Label>
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
              </div>

              {mode === 'advanced' && items.length > 1 && (
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
      </div>

      <div className="flex gap-4">
        <Button type="submit" className="flex-1">
          {template ? 'Update Template' : 'Create Template'}
        </Button>
        <Link href="/dashboard/templates" className="flex-1">
          <Button type="button" variant="outline" className="w-full">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  )
}
