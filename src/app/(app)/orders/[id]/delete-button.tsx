'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToastActions } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth-context'

export function DeleteOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const { toast } = useToastActions()
  const { role } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Only manager/super_admin can delete orders
  if (!role || !['super_admin', 'manager'].includes(role)) {
    return null
  }

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        toast.error(json.error ?? 'שגיאה במחיקת הזמנה')
        return
      }
      toast.success('ההזמנה נמחקה')
      router.push('/orders')
    } catch {
      toast.error('שגיאה במחיקת הזמנה')
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        <Trash2 size={14} />
        <span className="hidden md:inline">מחק</span>
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title="מחיקת הזמנה"
        description="האם למחוק את ההזמנה? כל הנתונים המשויכים יימחקו לצמיתות. פעולה זו לא ניתנת לביטול."
        confirmLabel="מחק הזמנה"
        loading={loading}
      />
    </>
  )
}
