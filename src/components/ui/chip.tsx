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
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all',
        'min-h-[28px] select-none cursor-pointer',
        active
          ? 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/30'
          : 'bg-transparent text-[#71717a] border-[#27272a] hover:text-[#a1a1aa] hover:border-[#3f3f46]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
