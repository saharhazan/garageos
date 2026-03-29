import * as React from 'react'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types'

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  received: {
    label: 'התקבל',
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  in_progress: {
    label: 'בטיפול',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  ready: {
    label: 'מוכן',
    className: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  delivered: {
    label: 'נמסר',
    className: 'bg-zinc-500/10 text-zinc-400 border-zinc-700',
  },
  cancelled: {
    label: 'בוטל',
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
}

const DOT_COLOR: Record<OrderStatus, string> = {
  received: 'bg-blue-400',
  in_progress: 'bg-yellow-400',
  ready: 'bg-green-400',
  delivered: 'bg-zinc-400',
  cancelled: 'bg-red-400',
}

interface StatusBadgeProps {
  status: OrderStatus
  dot?: boolean
  className?: string
}

export function StatusBadge({ status, dot = true, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[4px] border px-2 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {dot && (
        <span className={cn('inline-block h-1.5 w-1.5 rounded-full shrink-0', DOT_COLOR[status])} />
      )}
      {config.label}
    </span>
  )
}

export { STATUS_CONFIG }
