'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface Client {
  id: string
  name: string
}

interface Props {
  clients: Client[]
  currentStatus: string
  currentClient: string
  currentDateRange: string
}

const DATE_RANGES = [
  { label: 'All', value: 'all' },
  { label: 'Last week', value: 'week' },
  { label: 'Last month', value: 'month' },
  { label: 'Last year', value: 'year' },
]

export function InvoicesFilters({
  clients,
  currentStatus,
  currentClient,
  currentDateRange,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString())
    if (value === 'all' || value === '') {
      p.delete(key)
    } else {
      p.set(key, value)
    }
    router.push(`${pathname}?${p.toString()}`)
  }

  const activeDateRange = currentDateRange || 'all'

  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      <Select
        value={currentStatus || 'all'}
        onValueChange={(v) => updateParam('status', v)}
      >
        <SelectTrigger className="w-36 h-8 text-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="sent">Sent</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={currentClient || 'all'}
        onValueChange={(v) => updateParam('client', v)}
      >
        <SelectTrigger className="w-44 h-8 text-sm">
          <SelectValue placeholder="Client" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All clients</SelectItem>
          {clients.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-1">
        {DATE_RANGES.map(({ label, value }) => (
          <Button
            key={value}
            variant={activeDateRange === value ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-sm px-3"
            onClick={() => updateParam('dateRange', value)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}
