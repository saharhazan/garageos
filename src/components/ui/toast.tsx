'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Toast as ToastType } from '@/hooks/use-toast'

// ─── Style maps ───────────────────────────────────────────
const TOAST_STYLES: Record<ToastType['type'], string> = {
  success: 'bg-primary-container/90 text-primary border border-primary/20',
  error: 'bg-error-container/90 text-error border border-error/20',
  info: 'bg-surface-high text-on-surface border border-white/10',
}

const PROGRESS_STYLES: Record<ToastType['type'], string> = {
  success: 'bg-primary',
  error: 'bg-error',
  info: 'bg-on-surface-variant',
}

const TOAST_ICONS: Record<ToastType['type'], typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const DURATION = 4000

// ─── Toast Item ───────────────────────────────────────────
interface ToastItemProps {
  toast: ToastType
  onRemove: (id: string) => void
}

export function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(100)

  const Icon = TOAST_ICONS[toast.type]

  // Slide-in animation
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  // Progress bar countdown
  useEffect(() => {
    const start = Date.now()
    let frameId: number

    function tick() {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 1 - elapsed / DURATION) * 100
      setProgress(remaining)
      if (remaining > 0) {
        frameId = requestAnimationFrame(tick)
      }
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => onRemove(toast.id), 200)
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg shadow-xl transition-all duration-300 ease-out min-w-[280px] max-w-[380px]',
        TOAST_STYLES[toast.type],
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-4 opacity-0'
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <Icon size={18} className="shrink-0 mt-0.5" />
        <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
        <button
          onClick={handleClose}
          className="shrink-0 rounded-md p-0.5 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="סגור"
        >
          <X size={14} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] w-full bg-black/10">
        <div
          className={cn('h-full transition-none', PROGRESS_STYLES[toast.type])}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
