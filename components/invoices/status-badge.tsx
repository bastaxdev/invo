// components/invoices/status-badge.tsx

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<string, { color: string; label: string }> = {
    draft: {
      color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
      label: 'Draft',
    },
    sent: {
      color: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400',
      label: 'Sent',
    },
    paid: {
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
      label: 'Paid',
    },
    overdue: {
      color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
      label: 'Overdue',
    },
  }

  const variant = variants[status] || variants.draft

  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${variant.color}`}
    >
      {variant.label}
    </span>
  )
}
