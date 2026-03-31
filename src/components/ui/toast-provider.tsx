'use client'

import { useToast } from '@/hooks/use-toast'
import { ToastItem } from '@/components/ui/toast'

export function ToastRenderer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 left-4 z-[100] flex flex-col-reverse gap-2 backdrop-blur-sm rounded-xl p-1">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}
