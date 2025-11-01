// components/invoices/status-badge.tsx
import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<string, { color: string; label: string }> = {
    draft: { color: 'bg-slate-100 text-slate-800', label: 'Draft' },
    sent: { color: 'bg-blue-100 text-blue-800', label: 'Sent' },
    paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
    overdue: { color: 'bg-red-100 text-red-800', label: 'Overdue' },
  }

  const variant = variants[status] || variants.draft

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${variant.color}`}
    >
      {variant.label}
    </span>
  )
}
