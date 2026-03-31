'use client'

import { createContext, useContext, useCallback, useState, type ReactNode } from 'react'
import * as React from 'react'

// ─── Types ────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (type: ToastType, message: string) => void
  removeToast: (id: string) => void
}

// ─── Context ──────────────────────────────────────────────
const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
})

// ─── Provider ─────────────────────────────────────────────
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setToasts((prev) => [...prev, { id, type, message }])

    // Auto-dismiss after 4 seconds
    setTimeout(() => removeToast(id), 4000)
  }, [removeToast])

  const value = React.useMemo(
    () => ({ toasts, addToast, removeToast }),
    [toasts, addToast, removeToast]
  )

  return React.createElement(ToastContext.Provider, { value }, children)
}

// ─── Hook ─────────────────────────────────────────────────
export function useToast() {
  return useContext(ToastContext)
}

// ─── Convenience helpers ──────────────────────────────────
// These require being inside the ToastProvider tree.
// Usage: const { toast } = useToastActions()
export function useToastActions() {
  const { addToast } = useToast()

  const toast = React.useMemo(
    () => ({
      success: (message: string) => addToast('success', message),
      error: (message: string) => addToast('error', message),
      info: (message: string) => addToast('info', message),
    }),
    [addToast]
  )

  return { toast }
}
