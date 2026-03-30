import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-[4px] border px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        blue: 'bg-primary/10 text-primary border-primary/20',
        green: 'bg-success/10 text-success border-success/20',
        yellow: 'bg-tertiary/10 text-tertiary border-tertiary/20',
        red: 'bg-error/10 text-error border-error/20',
        gray: 'bg-on-surface-variant/10 text-on-surface-variant border-outline-variant',
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
            'bg-primary': variant === 'blue',
            'bg-success': variant === 'green',
            'bg-tertiary': variant === 'yellow',
            'bg-error': variant === 'red',
            'bg-on-surface-variant': variant === 'gray',
          })}
        />
      )}
      {children}
    </span>
  )
}
