'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Select } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { formatCurrency } from '@/lib/utils'
import type { OrderItem, WorkOrder } from '@/types'

const TAX_RATE = 0.17

interface LineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
}

function genId() {
  return Math.random().toString(36).slice(2)
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-black text-on-surface uppercase tracking-widest pb-3 border-b border-white/5 mb-4">
      {children}
    </h2>
  )
}

export default function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [jobNumber, setJobNumber] = useState('')

  // Editable fields
  const [items, setItems] = useState<LineItem[]>([])
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal')
  const [notes, setNotes] = useState('')
  const [technicianId, setTechnicianId] = useState('')

  // Errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Computed totals
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const taxAmount = subtotal * TAX_RATE
  const total = subtotal + taxAmount

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true)
      try {
        const res = await fetch(`/api/orders/${id}`)
        if (!res.ok) {
          setError('שגיאה בטעינת הזמנה')
          return
        }
        const { data } = await res.json()
        if (!data) {
          setError('הזמנה לא נמצאה')
          return
        }

        setJobNumber(data.job_number ?? '')
        setPriority(data.priority ?? 'normal')
        setNotes(data.notes ?? '')
        setTechnicianId(data.technician_id ?? '')

        // Map existing items
        const orderItems: LineItem[] = (data.items ?? []).map((item: OrderItem) => ({
          id: item.id || genId(),
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }))

        if (orderItems.length === 0) {
          orderItems.push({ id: genId(), description: '', quantity: 1, unit_price: 0 })
        }

        setItems(orderItems)
      } catch {
        setError('אירעה שגיאה בטעינת הזמנה')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  function addItem() {
    setItems((prev) => [...prev, { id: genId(), description: '', quantity: 1, unit_price: 0 }])
  }

  function removeItem(itemId: string) {
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  function updateItem(itemId: string, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item))
    )
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (items.every((i) => !i.description.trim())) errs.items = 'יש להוסיף לפחות פריט אחד'
    return errs
  }

  async function handleSave() {
    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)
    setError('')

    try {
      const orderItems = items
        .filter((i) => i.description.trim())
        .map((i) => ({
          id: i.id,
          description: i.description,
          quantity: i.quantity,
          unit_price: i.unit_price,
          total: i.quantity * i.unit_price,
        }))

      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems,
          priority,
          notes: notes.trim() || null,
          technician_id: technicianId || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'שגיאה בעדכון הזמנה')
        return
      }

      router.push(`/orders/${id}`)
    } catch {
      setError('אירעה שגיאה. נסה שוב.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-full bg-surface">
        <Topbar title="עריכת עבודה" backHref={`/orders/${id}`} />
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full pb-24 bg-surface">
      <Topbar title={`עריכת ${jobNumber}`} backHref={`/orders/${id}`} />

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-8">
        {error && (
          <div className="rounded-lg border border-error/20 bg-error/10 px-4 py-3">
            <p className="text-sm text-error font-bold">{error}</p>
          </div>
        )}

        {/* Section: Items */}
        <section>
          <SectionTitle>עבודות ופריטים</SectionTitle>

          {fieldErrors.items && (
            <p className="text-xs text-error mb-3">{fieldErrors.items}</p>
          )}

          <div className="space-y-2">
            {/* Header */}
            <div className="hidden md:grid grid-cols-[1fr_80px_100px_80px_36px] gap-2 px-1">
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">תיאור</span>
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider text-center">כמות</span>
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider text-center">מחיר</span>
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider text-center">{"סה\"כ"}</span>
              <span />
            </div>

            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex flex-col md:grid md:grid-cols-[1fr_80px_100px_80px_36px] gap-2 bg-surface-high rounded-xl border border-white/5 p-3 md:p-0 md:bg-transparent md:border-none md:rounded-none"
              >
                {/* Mobile label */}
                <div className="md:hidden flex items-center justify-between mb-2">
                  <span className="text-xs text-on-surface-variant font-bold">פריט {index + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-on-surface-variant hover:text-error transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="תיאור העבודה / פריט"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  className="h-11 rounded-md border border-outline-variant/20 bg-surface-lowest px-3 text-sm text-on-surface placeholder:text-outline outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                />

                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="h-9 rounded-[6px] border border-white/5 bg-surface-lowest px-3 text-sm text-on-surface text-center outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                  dir="ltr"
                />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={item.unit_price || ''}
                  onChange={(e) =>
                    updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)
                  }
                  className="h-9 rounded-[6px] border border-white/5 bg-surface-lowest px-3 text-sm text-on-surface text-center outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                  dir="ltr"
                />

                <div className="hidden md:flex items-center justify-center h-11 text-sm font-bold text-on-surface tabular-nums">
                  {formatCurrency(item.quantity * item.unit_price)}
                </div>

                <div className="hidden md:flex items-center justify-center">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="flex items-center justify-center w-9 h-9 rounded-md text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Mobile total */}
                <div className="md:hidden flex items-center justify-between pt-2 border-t border-white/5 mt-1">
                  <span className="text-xs text-on-surface-variant">{"סה\"כ פריט"}</span>
                  <span className="text-sm font-bold text-on-surface tabular-nums">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Button type="button" variant="ghost" size="sm" onClick={addItem} className="mt-3">
            <Plus size={14} />
            הוסף פריט
          </Button>

          {/* Totals */}
          <div className="mt-4 rounded-xl bg-surface-high p-4 space-y-2 border border-white/5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">סכום ביניים</span>
              <span className="text-on-surface tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">{"מע\"מ 17%"}</span>
              <span className="text-on-surface tabular-nums">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span className="text-sm font-black text-on-surface">{"סה\"כ לתשלום"}</span>
              <span className="text-xl font-black text-primary tabular-nums">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </section>

        {/* Section: Details */}
        <section>
          <SectionTitle>פרטים נוספים</SectionTitle>
          <div className="space-y-4">
            <Select
              label="עדיפות"
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'normal' | 'high' | 'urgent')}
            >
              <option value="normal">רגיל</option>
              <option value="high">גבוה</option>
              <option value="urgent">דחוף</option>
            </Select>

            <Textarea
              label="הערות"
              placeholder="הוספת הערות לעבודה..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </section>
      </div>

      {/* Sticky bottom bar */}
      <div
        className="fixed bottom-0 inset-x-0 z-40 bg-surface/90 backdrop-blur-md border-t border-white/5 px-4 py-3 flex items-center justify-between gap-3 md:px-6"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <Button
          variant="default"
          size="lg"
          onClick={() => router.push(`/orders/${id}`)}
          className="flex-1 md:flex-none"
        >
          ביטול
        </Button>
        <Button
          variant="primary"
          size="lg"
          loading={saving}
          onClick={handleSave}
          className="flex-1 md:flex-none"
        >
          שמור שינויים
        </Button>
      </div>
    </div>
  )
}
