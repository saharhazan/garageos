import * as React from 'react'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types'

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string; animatedDot?: boolean }> = {
  received: {
    label: 'התקבל',
    className: 'bg-primary/20 text-primary border-primary/20',
  },
  in_progress: {
    label: 'בטיפול',
    className: 'bg-secondary-container/20 text-secondary border-secondary/20',
    animatedDot: true,
  },
  ready: {
    label: 'מוכן',
    className: 'bg-success/20 text-success border-success/20',
  },
  delivered: {
    label: 'נמסר',
    className: 'bg-on-surface-variant/20 text-on-surface-variant border-on-surface-variant/20',
  },
  cancelled: {
    label: 'בוטל',
    className: 'bg-error/20 text-error border-error/20',
  },
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
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold',
        config.className,
        className
      )}
    >
      {dot && config.animatedDot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {dot && !config.animatedDot && (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-current shrink-0" />
      )}
      {config.label}
    </span>
  )
}

export { STATUS_CONFIG }
