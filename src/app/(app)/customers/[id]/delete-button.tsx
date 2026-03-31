'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToastActions } from '@/hooks/use-toast'

export function DeleteCustomerButton({ customerId }: { customerId: string }) {
  const router = useRouter()
  const { toast } = useToastActions()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/customers/${customerId}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        toast.error(json.error ?? 'שגיאה במחיקת לקוח')
        return
      }
      toast.success('הלקוח נמחק')
      router.push('/customers')
    } catch {
      toast.error('שגיאה במחיקת לקוח')
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
        title="מחיקת לקוח"
        description="האם למחוק את הלקוח? כל הנתונים המשויכים יימחקו לצמיתות. פעולה זו לא ניתנת לביטול."
        confirmLabel="מחק לקוח"
        loading={loading}
      />
    </>
  )
}
