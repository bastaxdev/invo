// components/analytics/currency-selector.tsx
'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CurrencySelectorProps {
  defaultCurrency: string
  currentCurrency: string
  onCurrencyChange: (currency: string) => void
}

export function CurrencySelector({
  defaultCurrency,
  currentCurrency,
  onCurrencyChange,
}: CurrencySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-foreground font-medium">View in:</span>
      <Select value={currentCurrency} onValueChange={onCurrencyChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={defaultCurrency}>
            {defaultCurrency} (Default)
          </SelectItem>
          {defaultCurrency !== 'PLN' && (
            <SelectItem value="PLN">PLN (Polish Złoty)</SelectItem>
          )}
          {defaultCurrency !== 'NOK' && (
            <SelectItem value="NOK">NOK (Norwegian Krone)</SelectItem>
          )}
          {defaultCurrency !== 'EUR' && (
            <SelectItem value="EUR">EUR (Euro)</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
