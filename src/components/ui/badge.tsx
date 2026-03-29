import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-[4px] border px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        green: 'bg-green-500/10 text-green-400 border-green-500/20',
        yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        red: 'bg-red-500/10 text-red-400 border-red-500/20',
        gray: 'bg-zinc-500/10 text-zinc-400 border-zinc-700',
      },
    },
    defaultVariants: { variant: 'gray' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn('inline-block h-1.5 w-1.5 rounded-full shrink-0', {
            'bg-blue-400': variant === 'blue',
            'bg-green-400': variant === 'green',
            'bg-yellow-400': variant === 'yellow',
            'bg-red-400': variant === 'red',
            'bg-zinc-400': variant === 'gray',
          })}
        />
      )}
      {children}
    </span>
  )
}
