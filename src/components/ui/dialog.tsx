'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      window.addEventListener('keydown', handleKey)
    }
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!mounted) return null

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 transition-all',
        open ? 'pointer-events-auto' : 'pointer-events-none'
      )}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      {/* Mobile: slides up from bottom */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 rounded-t-2xl bg-surface-high border-t border-white/5 transition-transform duration-300 ease-out',
          'md:relative md:inset-auto md:rounded-xl md:border md:border-white/5 md:max-w-lg md:w-full md:mx-auto md:top-1/2 md:-translate-y-1/2',
          open ? 'translate-y-0' : 'translate-y-full md:translate-y-[-40%]',
          'md:transition-all md:duration-200',
          open ? 'md:opacity-100 md:scale-100' : 'md:opacity-0 md:scale-95',
          className
        )}
      >
        {/* Drag handle on mobile */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-8 h-1 rounded-full bg-outline-variant" />
        </div>

        {(title || description) && (
          <div className="flex items-start justify-between gap-4 px-4 py-3 border-b border-white/5">
            <div>
              {title && (
                <h2 className="text-sm font-semibold text-on-surface">{title}</h2>
              )}
              {description && (
                <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-md p-1 text-outline hover:text-on-surface-variant hover:bg-white/5 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="overflow-y-auto max-h-[80dvh] md:max-h-[70dvh]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

export function DialogFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2 p-4 border-t border-white/5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DialogBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-4', className)} {...props}>
      {children}
    </div>
  )
}
