'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth-context'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Select } from '@/components/ui/input'
import { AutocompleteInput, type AutocompleteSuggestion } from '@/components/ui/autocomplete-input'
import { formatCurrency } from '@/lib/utils'

interface CustomerResult {
  id: string
  full_name: string
  phone: string
  email: string | null
  vehicles: {
    id: string
    license_plate: string
    make: string | null
    model: string | null
    year: number | null
    color: string | null
  }[]
}

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

export default function NewOrderPage() {
  const router = useRouter()
  const { garageId } = useAuth()
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const plateInputRef = useRef<HTMLInputElement>(null)

  // Vehicle fields
  const [licensePlate, setLicensePlate] = useState('')
  const [plateLoading, setPlateLoading] = useState(false)
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [color, setColor] = useState('')
  const [mileage, setMileage] = useState('')

  // Customer fields
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')

  // Items
  const [items, setItems] = useState<LineItem[]>([
    { id: genId(), description: '', quantity: 1, unit_price: 0 },
  ])

  // Details
  const [technicianId, setTechnicianId] = useState('')
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal')
  const [notes, setNotes] = useState('')

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Customer autocomplete
  const [customerSuggestions, setCustomerSuggestions] = useState<AutocompleteSuggestion[]>([])
  const [customerResults, setCustomerResults] = useState<CustomerResult[]>([])
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  const searchCustomers = useCallback((query: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    if (query.length < 2) {
      setCustomerSuggestions([])
      setCustomerResults([])
      return
    }
    searchTimeoutRef.current = setTimeout(async () => {
      setCustomerSearchLoading(true)
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('customers')
          .select('*, vehicles(*)')
          .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
          .limit(5)

        const results = (data ?? []) as CustomerResult[]
        setCustomerResults(results)
        setCustomerSuggestions(
          results.map((c) => ({
            id: c.id,
            label: c.full_name,
            secondary: c.phone,
          }))
        )
      } catch {
        // ignore
      } finally {
        setCustomerSearchLoading(false)
      }
    }, 300)
  }, [])

  function handleCustomerSelect(suggestion: AutocompleteSuggestion) {
    const customer = customerResults.find((c) => c.id === suggestion.id)
    if (!customer) return
    setCustomerName(customer.full_name)
    setCustomerPhone(customer.phone)
    setCustomerEmail(customer.email ?? '')
    setCustomerSuggestions([])
    setCustomerResults([])

    // Auto-fill first vehicle if exists
    if (customer.vehicles?.length > 0) {
      const v = customer.vehicles[0]
      setLicensePlate(v.license_plate ?? '')
      setMake(v.make ?? '')
      setModel(v.model ?? '')
      setYear(v.year?.toString() ?? '')
      setColor(v.color ?? '')
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [])

  // Computed totals
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const taxAmount = subtotal * TAX_RATE
  const total = subtotal + taxAmount

  // Plate lookup
  const handlePlateLookup = useCallback(async (plate: string) => {
    if (plate.length < 6) return
    setPlateLoading(true)
    try {
      const supabase = createClient()
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('*, customer:customers(*)')
        .eq('license_plate', plate.toUpperCase())
        .single()

      if (vehicle) {
        setMake(vehicle.make ?? '')
        setModel(vehicle.model ?? '')
        setYear(vehicle.year?.toString() ?? '')
        setColor(vehicle.color ?? '')
        if (vehicle.customer) {
          setCustomerName(vehicle.customer.full_name ?? '')
          setCustomerPhone(vehicle.customer.phone ?? '')
          setCustomerEmail(vehicle.customer.email ?? '')
        }
      }
    } catch {
      // No match - that's fine, user fills in manually
    } finally {
      setPlateLoading(false)
    }
  }, [])

  function addItem() {
    setItems((prev) => [...prev, { id: genId(), description: '', quantity: 1, unit_price: 0 }])
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  function updateItem(id: string, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!licensePlate.trim()) errs.licensePlate = 'שדה חובה'
    if (!customerName.trim()) errs.customerName = 'שדה חובה'
    if (!customerPhone.trim()) errs.customerPhone = 'שדה חובה'
    if (items.every((i) => !i.description.trim())) errs.items = 'יש להוסיף לפחות פריט אחד'
    return errs
  }

  async function handleSave(isDraft: boolean) {
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const setter = isDraft ? setSaving : setSubmitting
    setter(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (!garageId) return

      // Upsert customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .upsert(
          {
            garage_id: garageId,
            full_name: customerName.trim(),
            phone: customerPhone.trim(),
            email: customerEmail.trim() || null,
          },
          { onConflict: 'garage_id,phone' }
        )
        .select()
        .single()

      if (customerError || !customer) {
        setErrors({ global: 'שגיאה בשמירת פרטי לקוח' })
        return
      }

      // Upsert vehicle
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .upsert(
          {
            garage_id: garageId,
            customer_id: customer.id,
            license_plate: licensePlate.toUpperCase().trim(),
            make: make.trim() || null,
            model: model.trim() || null,
            year: year ? parseInt(year) : null,
            color: color.trim() || null,
          },
          { onConflict: 'garage_id,license_plate' }
        )
        .select()
        .single()

      if (vehicleError || !vehicle) {
        setErrors({ global: 'שגיאה בשמירת פרטי רכב' })
        return
      }

      // Create work order via API (handles job number generation + tax calculation server-side)
      const orderItems = items
        .filter((i) => i.description.trim())
        .map((i) => ({
          id: i.id,
          description: i.description,
          quantity: i.quantity,
          unit_price: i.unit_price,
          total: i.quantity * i.unit_price,
        }))

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.id,
          vehicle_id: vehicle.id,
          technician_id: technicianId || undefined,
          priority,
          items: orderItems,
          notes: notes.trim() || undefined,
          mileage: mileage ? parseInt(mileage) : undefined,
        }),
      })

      const result = await res.json()

      if (!res.ok || !result.data) {
        setErrors({ global: result.error ?? 'שגיאה ביצירת העבודה' })
        return
      }

      router.push(`/orders/${result.data.id}`)
    } catch (e) {
      console.error(e)
      setErrors({ global: 'אירעה שגיאה. נסה שוב.' })
    } finally {
      setter(false)
    }
  }

  return (
    <div className="min-h-full pb-24 bg-surface">
      <Topbar title="עבודה חדשה" backHref="/orders" />

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-8">
        {errors.global && (
          <div className="rounded-lg border border-error/20 bg-error/10 px-4 py-3">
            <p className="text-sm text-error font-bold">{errors.global}</p>
          </div>
        )}

        {/* Section 1: Vehicle */}
        <section>
          <SectionTitle>רכב</SectionTitle>
          <div className="space-y-4">
            {/* License plate - prominent */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-on-surface-variant">לוחית רישוי *</label>
              <div className="relative">
                <div className="absolute right-0 top-0 bottom-0 w-6 bg-primary-container rounded-r-lg flex items-center justify-center pointer-events-none z-10">
                  <span className="text-[8px] text-white font-bold">IL</span>
                </div>
                <input
                  ref={plateInputRef}
                  type="text"
                  placeholder="12-345-67"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  onBlur={() => handlePlateLookup(licensePlate)}
                  className={`h-14 w-full rounded-lg border bg-[#F5D015]/10 pr-10 pl-4 text-xl font-mono font-black text-on-surface placeholder:text-outline uppercase outline-none transition-all tracking-[0.2em] ${
                    errors.licensePlate
                      ? 'border-error/60 focus:border-error focus:ring-error/10'
                      : 'border-tertiary/30 focus:border-tertiary focus:ring-2 focus:ring-tertiary/10'
                  }`}
                  dir="ltr"
                  autoComplete="off"
                />
                {plateLoading && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {errors.licensePlate && (
                <p className="text-xs text-error">{errors.licensePlate}</p>
              )}
              <p className="text-xs text-outline">
                הזן לוחית ופרטי הרכב ימולאו אוטומטית אם קיים במערכת
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="יצרן"
                placeholder="Toyota"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                dir="ltr"
              />
              <Input
                label="דגם"
                placeholder="Corolla"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                dir="ltr"
              />
              <Input
                label="שנה"
                placeholder="2020"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                dir="ltr"
              />
              <Input
                label="צבע"
                placeholder="לבן"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>

            <Input
              label="קילומטראז'"
              placeholder="75000"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              type="number"
              hint="קילומטר בעת הכניסה"
              dir="ltr"
            />
          </div>
        </section>

        {/* Section 2: Customer */}
        <section>
          <SectionTitle>לקוח</SectionTitle>
          <div className="space-y-4">
            <AutocompleteInput
              label="שם מלא *"
              placeholder="ישראל ישראלי"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value)
                searchCustomers(e.target.value)
              }}
              onSelect={handleCustomerSelect}
              suggestions={customerSuggestions}
              loading={customerSearchLoading}
              error={errors.customerName}
            />
            <div className="grid grid-cols-2 gap-3">
              <AutocompleteInput
                label="טלפון *"
                placeholder="050-0000000"
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value)
                  searchCustomers(e.target.value)
                }}
                onSelect={handleCustomerSelect}
                suggestions={customerSuggestions}
                loading={customerSearchLoading}
                error={errors.customerPhone}
                type="tel"
                dir="ltr"
              />
              <Input
                label="אימייל"
                placeholder="email@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                type="email"
                dir="ltr"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Items */}
        <section>
          <SectionTitle>עבודות ופריטים</SectionTitle>

          {errors.items && (
            <p className="text-xs text-error mb-3">{errors.items}</p>
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
              <div key={item.id} className="flex flex-col md:grid md:grid-cols-[1fr_80px_100px_80px_36px] gap-2 bg-surface-high rounded-xl border border-white/5 p-3 md:p-0 md:bg-transparent md:border-none md:rounded-none">
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
                  onChange={(e) => updateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-9 rounded-[6px] border border-white/5 bg-surface-lowest px-3 text-sm text-on-surface text-center outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                  dir="ltr"
                />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={item.unit_price || ''}
                  onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
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

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addItem}
            className="mt-3"
          >
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

        {/* Section 4: Details */}
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
      <div className="fixed bottom-0 inset-x-0 z-40 bg-surface/90 backdrop-blur-md border-t border-white/5 px-4 py-3 flex items-center justify-between gap-3 md:px-6"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <Button
          variant="default"
          size="lg"
          loading={saving}
          disabled={submitting}
          onClick={() => handleSave(true)}
          className="flex-1 md:flex-none"
        >
          שמור טיוטה
        </Button>
        <Button
          variant="primary"
          size="lg"
          loading={submitting}
          disabled={saving}
          onClick={() => handleSave(false)}
          className="flex-1 md:flex-none"
        >
          פתח עבודה
        </Button>
      </div>
    </div>
  )
}
