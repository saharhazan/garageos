import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? React.useId()

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-bold text-on-surface-variant"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-11 w-full rounded-md border bg-surface-lowest px-3 text-on-surface placeholder:text-outline',
            'border-outline-variant/20 transition-all outline-none',
            'focus:border-primary/40 focus:ring-2 focus:ring-primary/10',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            error && 'border-error/60 focus:border-error focus:ring-error/10',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-outline">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-error">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? React.useId()

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-bold text-on-surface-variant"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-md border bg-surface-lowest px-3 py-2 text-on-surface placeholder:text-outline',
            'border-outline-variant/20 transition-all outline-none resize-none',
            'focus:border-primary/40 focus:ring-2 focus:ring-primary/10',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            error && 'border-error/60 focus:border-error focus:ring-error/10',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-outline">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-error">{error}</p>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, id, children, ...props }, ref) => {
    const inputId = id ?? React.useId()

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-bold text-on-surface-variant"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'h-11 w-full rounded-md border bg-surface-lowest px-3 text-on-surface',
            'border-outline-variant/20 transition-all outline-none appearance-none cursor-pointer',
            'focus:border-primary/40 focus:ring-2 focus:ring-primary/10',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            error && 'border-error/60',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {hint && !error && (
          <p className="text-xs text-outline">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-error">{error}</p>
        )}
      </div>
    )
  }
)
Select.displayName = 'Select'
