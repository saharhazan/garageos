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
            className="text-sm font-medium text-[#a1a1aa]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-9 w-full rounded-[6px] border bg-[#09090b] px-3 text-[#fafafa] placeholder:text-[#52525b]',
            'border-[#27272a] transition-all outline-none',
            'focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-500/10',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            error && 'border-red-500/60 focus:border-red-500 focus:ring-red-500/10',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-[#52525b]">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-red-400">{error}</p>
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
            className="text-sm font-medium text-[#a1a1aa]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-[6px] border bg-[#09090b] px-3 py-2 text-[#fafafa] placeholder:text-[#52525b]',
            'border-[#27272a] transition-all outline-none resize-none',
            'focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-500/10',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            error && 'border-red-500/60 focus:border-red-500 focus:ring-red-500/10',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-[#52525b]">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-red-400">{error}</p>
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
            className="text-sm font-medium text-[#a1a1aa]"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'h-9 w-full rounded-[6px] border bg-[#09090b] px-3 text-[#fafafa]',
            'border-[#27272a] transition-all outline-none appearance-none cursor-pointer',
            'focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-500/10',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            error && 'border-red-500/60',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {hint && !error && (
          <p className="text-xs text-[#52525b]">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    )
  }
)
Select.displayName = 'Select'
