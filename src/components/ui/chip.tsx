import * as React from 'react'
import { cn } from '@/lib/utils'

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export function Chip({ active, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all',
        'min-h-[28px] select-none cursor-pointer',
        active
          ? 'bg-primary-container text-white'
          : 'bg-surface-high text-on-surface-variant hover:bg-surface-highest',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
