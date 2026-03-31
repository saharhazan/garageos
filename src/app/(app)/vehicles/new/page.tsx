'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { useToastActions } from '@/hooks/use-toast'

export default function NewVehiclePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const customerId = searchParams.get('customer_id')

  const { toast } = useToastActions()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [licensePlate, setLicensePlate] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [color, setColor] = useState('')
  const [vin, setVin] = useState('')
  const [notes, setNotes] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function validate() {
    const errs: Record<string, string> = {}
    if (!licensePlate.trim()) errs.licensePlate = 'שדה חובה'
    if (!make.trim()) errs.make = 'שדה חובה'
    if (!model.trim()) errs.model = 'שדה חובה'
    if (!customerId) errs.global = 'חסר מזהה לקוח'
    return errs
  }

  async function handleSave() {
    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) {
      if (errs.global) setError(errs.global)
      return
    }

    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          license_plate: licensePlate.toUpperCase().trim(),
          make: make.trim(),
          model: model.trim(),
          year: year ? parseInt(year) : null,
          color: color.trim() || null,
          vin: vin.trim() || null,
          notes: notes.trim() || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg = data.error ?? 'שגיאה בהוספת רכב'
        setError(msg)
        toast.error(msg)
        return
      }

      toast.success('רכב נוסף בהצלחה')
      router.push(`/customers/${customerId}`)
      router.refresh()
    } catch {
      setError('אירעה שגיאה. נסה שוב.')
      toast.error('אירעה שגיאה. נסה שוב.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-full">
      <Topbar title="רכב חדש" backHref={customerId ? `/customers/${customerId}` : '/customers'} />

      <div className="px-4 py-5 max-w-lg mx-auto space-y-6">
        {error && (
          <div className="rounded-md bg-error/10 border border-error/20 px-3 py-2">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-on-surface-variant">לוחית רישוי *</label>
          <input
            type="text"
            placeholder="12-345-67"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            className={`h-14 w-full rounded-md border bg-[#F5D015]/10 px-4 text-xl font-mono font-black text-on-surface placeholder:text-outline uppercase outline-none transition-all tracking-widest ${
              fieldErrors.licensePlate
                ? 'border-error/60 focus:border-error'
                : 'border-outline-variant/20 focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/10'
            }`}
            dir="ltr"
            autoComplete="off"
          />
          {fieldErrors.licensePlate && <p className="text-xs text-error">{fieldErrors.licensePlate}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="יצרן *" placeholder="Toyota" value={make} onChange={(e) => setMake(e.target.value)} error={fieldErrors.make} dir="ltr" />
          <Input label="דגם *" placeholder="Corolla" value={model} onChange={(e) => setModel(e.target.value)} error={fieldErrors.model} dir="ltr" />
          <Input label="שנה" placeholder="2020" value={year} onChange={(e) => setYear(e.target.value)} type="number" dir="ltr" />
          <Input label="צבע" placeholder="לבן" value={color} onChange={(e) => setColor(e.target.value)} />
        </div>

        <Input label="מספר שלדה (VIN)" placeholder="WVWZZZ..." value={vin} onChange={(e) => setVin(e.target.value)} dir="ltr" />

        <Textarea
          label="הערות"
          placeholder="הערות על הרכב..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleSave}
          loading={saving}
        >
          שמור רכב
        </Button>
      </div>
    </div>
  )
}
