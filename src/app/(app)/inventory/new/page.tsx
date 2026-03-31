'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Select } from '@/components/ui/input'
import { useToastActions } from '@/hooks/use-toast'

export default function NewInventoryItemPage() {
  const router = useRouter()
  const { toast } = useToastActions()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [quantity, setQuantity] = useState('')
  const [minQuantity, setMinQuantity] = useState('5')
  const [unitPrice, setUnitPrice] = useState('')
  const [supplier, setSupplier] = useState('')
  const [category, setCategory] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function validate() {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'שדה חובה'
    return errs
  }

  async function handleSave() {
    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          sku: sku.trim() || null,
          quantity: quantity ? parseInt(quantity) : 0,
          min_quantity: minQuantity ? parseInt(minQuantity) : 5,
          unit_price: unitPrice ? parseFloat(unitPrice) : 0,
          supplier: supplier.trim() || null,
          category: category.trim() || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg = data.error ?? 'שגיאה ביצירת פריט מלאי'
        setError(msg)
        toast.error(msg)
        return
      }

      toast.success('פריט נוסף למלאי')
      router.push('/inventory')
    } catch {
      setError('אירעה שגיאה. נסה שוב.')
      toast.error('אירעה שגיאה. נסה שוב.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-full">
      <Topbar title="פריט מלאי חדש" backHref="/inventory" />

      <div className="px-4 py-5 max-w-lg mx-auto space-y-6">
        {error && (
          <div className="rounded-md bg-error/10 border border-error/20 px-3 py-2">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        <Input
          label="שם פריט *"
          placeholder="שם החלק או הפריט"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
        />

        <Input
          label='מק"ט'
          placeholder="SKU-12345"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          dir="ltr"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="כמות"
            placeholder="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            type="number"
            min="0"
            dir="ltr"
          />
          <Input
            label="כמות מינימום"
            placeholder="5"
            value={minQuantity}
            onChange={(e) => setMinQuantity(e.target.value)}
            type="number"
            min="0"
            dir="ltr"
            hint="התראה כשמלאי נמוך"
          />
        </div>

        <Input
          label="מחיר יחידה"
          placeholder="0.00"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          type="number"
          min="0"
          step="0.01"
          dir="ltr"
        />

        <Input
          label="ספק"
          placeholder="שם הספק"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
        />

        <Input
          label="קטגוריה"
          placeholder="חלפים, שמנים, צמיגים..."
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleSave}
          loading={saving}
        >
          שמור פריט
        </Button>
      </div>
    </div>
  )
}
