'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { OrderStatus } from '@/types'

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  received: 'in_progress',
  in_progress: 'ready',
  ready: 'delivered',
}

const NEXT_STATUS_BUTTON_LABEL: Record<string, string> = {
  received: 'העבר לטיפול',
  in_progress: 'סמן כמוכן',
  ready: 'סמן כנמסר',
  delivered: 'נמסר',
  cancelled: 'בוטל',
}

interface StatusButtonProps {
  orderId: string
  currentStatus: OrderStatus
}

export function StatusButton({ orderId, currentStatus }: StatusButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const nextStatus = NEXT_STATUS[currentStatus]
  const label = NEXT_STATUS_BUTTON_LABEL[currentStatus]
  const isDisabled = currentStatus === 'delivered' || currentStatus === 'cancelled'

  async function handleStatusUpdate() {
    if (!nextStatus) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error ?? 'שגיאה בעדכון סטטוס')
        return
      }

      router.refresh()
    } catch {
      setError('אירעה שגיאה. נסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="primary"
        size="default"
        onClick={handleStatusUpdate}
        loading={loading}
        disabled={isDisabled}
      >
        {!isDisabled && <ArrowRight size={14} />}
        {label}
      </Button>
      {error && (
        <p className="text-xs text-error">{error}</p>
      )}
    </div>
  )
}
