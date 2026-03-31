'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Clock,
  User,
  Phone,
  Car,
  Calendar,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { Spinner } from '@/components/ui/spinner'
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Input, Select, Textarea } from '@/components/ui/input'
import { AutocompleteInput, type AutocompleteSuggestion } from '@/components/ui/autocomplete-input'
import type { Appointment, AppointmentStatus } from '@/types'

// ─── Constants ────────────────────────────────────────────

const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const MONTHS_HE = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
]

const HOUR_START = 7
const HOUR_END = 20
const SLOT_HEIGHT = 48 // px per 30 min slot

const SERVICE_TYPES = [
  { value: 'טיפול שוטף', label: 'טיפול שוטף' },
  { value: 'תיקון', label: 'תיקון' },
  { value: 'אבחון', label: 'אבחון' },
  { value: 'טסט שנתי', label: 'טסט שנתי' },
  { value: 'החלפת שמן', label: 'החלפת שמן' },
  { value: 'בלמים', label: 'בלמים' },
  { value: 'אחר', label: 'אחר' },
]

const DURATION_OPTIONS = [
  { value: '30', label: '30 דקות' },
  { value: '60', label: '60 דקות' },
  { value: '90', label: '90 דקות' },
  { value: '120', label: '120 דקות' },
]

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: 'מתוזמן',
  confirmed: 'מאושר',
  in_progress: 'בטיפול',
  completed: 'הושלם',
  cancelled: 'בוטל',
  no_show: 'לא הגיע',
}

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  scheduled: 'bg-primary/20 border-primary/30 text-primary',
  confirmed: 'bg-primary/40 border-primary/50 text-white',
  in_progress: 'bg-secondary-container/80 border-secondary/50 text-white',
  completed: 'bg-success/20 border-success/30 text-success',
  cancelled: 'bg-error/20 border-error/30 text-error',
  no_show: 'bg-error/10 border-error/20 text-error/70',
}

// ─── Helpers ────────────────────────────────────────────

function getSundayOfWeek(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  return d
}

function formatWeekRange(sunday: Date): string {
  const saturday = new Date(sunday)
  saturday.setDate(saturday.getDate() + 6)
  const startDay = sunday.getDate()
  const endDay = saturday.getDate()
  const startMonth = MONTHS_HE[sunday.getMonth()]
  const endMonth = MONTHS_HE[saturday.getMonth()]
  const year = sunday.getFullYear()
  if (sunday.getMonth() === saturday.getMonth()) {
    return `${startDay}-${endDay} ${startMonth} ${year}`
  }
  return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function getTimeSlots(): string[] {
  const slots: string[] = []
  for (let h = HOUR_START; h <= HOUR_END; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    if (h < HOUR_END) slots.push(`${String(h).padStart(2, '0')}:30`)
  }
  return slots
}

// ─── Main Component ─────────────────────────────────────

export default function AppointmentsPage() {
  const [weekStart, setWeekStart] = useState(() => getSundayOfWeek(new Date()))
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDay()) // For mobile day view
  const [mobileView, setMobileView] = useState<'day' | 'list'>('day')

  // Dialog state
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [saving, setSaving] = useState(false)

  // New appointment form state
  const [formDate, setFormDate] = useState('')
  const [formTime, setFormTime] = useState('09:00')
  const [formDuration, setFormDuration] = useState('60')
  const [formServiceType, setFormServiceType] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formCustomerName, setFormCustomerName] = useState('')
  const [formCustomerPhone, setFormCustomerPhone] = useState('')
  const [formCustomerId, setFormCustomerId] = useState<string | null>(null)
  const [formVehicleId, setFormVehicleId] = useState<string | null>(null)

  // Customer autocomplete
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerSuggestions, setCustomerSuggestions] = useState<AutocompleteSuggestion[]>([])
  const [customerLoading, setCustomerLoading] = useState(false)
  const [vehicles, setVehicles] = useState<{ id: string; label: string }[]>([])

  // Status update
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const timeSlots = useMemo(() => getTimeSlots(), [])

  // ─── Fetch appointments ──────────────────────────────

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/appointments?week=${weekStart.toISOString().split('T')[0]}`
      )
      const json = await res.json()
      if (res.ok) {
        setAppointments(json.data ?? [])
      }
    } catch (err) {
      console.error('Error fetching appointments:', err)
    } finally {
      setLoading(false)
    }
  }, [weekStart])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  // ─── Customer search ─────────────────────────────────

  useEffect(() => {
    if (customerSearch.length < 2) {
      setCustomerSuggestions([])
      return
    }
    const timeout = setTimeout(async () => {
      setCustomerLoading(true)
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('customers')
          .select('id, full_name, phone')
          .or(`full_name.ilike.%${customerSearch}%,phone.ilike.%${customerSearch}%`)
          .limit(8)

        setCustomerSuggestions(
          (data ?? []).map((c) => ({
            id: c.id,
            label: c.full_name,
            secondary: c.phone,
          }))
        )
      } finally {
        setCustomerLoading(false)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [customerSearch])

  // ─── Load vehicles for selected customer ─────────────

  useEffect(() => {
    if (!formCustomerId) {
      setVehicles([])
      setFormVehicleId(null)
      return
    }
    async function loadVehicles() {
      const supabase = createClient()
      const { data } = await supabase
        .from('vehicles')
        .select('id, license_plate, make, model')
        .eq('customer_id', formCustomerId!)
      setVehicles(
        (data ?? []).map((v) => ({
          id: v.id,
          label: `${v.make} ${v.model} - ${v.license_plate}`,
        }))
      )
    }
    loadVehicles()
  }, [formCustomerId])

  // ─── Week navigation ─────────────────────────────────

  function goToPrevWeek() {
    setWeekStart((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() - 7)
      return d
    })
  }

  function goToNextWeek() {
    setWeekStart((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + 7)
      return d
    })
  }

  function goToThisWeek() {
    setWeekStart(getSundayOfWeek(new Date()))
  }

  // ─── Open new appointment dialog ─────────────────────

  function openNewDialog(dayOffset?: number, time?: string) {
    const date = new Date(weekStart)
    if (dayOffset !== undefined) {
      date.setDate(date.getDate() + dayOffset)
    } else {
      // Default to today or first day of week
      const todayOffset = Math.max(0, Math.min(6, today.getDay()))
      date.setDate(date.getDate() + todayOffset)
    }
    setFormDate(date.toISOString().split('T')[0])
    setFormTime(time ?? '09:00')
    setFormDuration('60')
    setFormServiceType('')
    setFormNotes('')
    setFormCustomerName('')
    setFormCustomerPhone('')
    setFormCustomerId(null)
    setFormVehicleId(null)
    setCustomerSearch('')
    setCustomerSuggestions([])
    setShowNewDialog(true)
  }

  function openDetailDialog(appointment: Appointment) {
    setSelectedAppointment(appointment)
    setShowDetailDialog(true)
  }

  // ─── Create appointment ──────────────────────────────

  async function handleCreate() {
    if (!formDate || !formTime) return
    setSaving(true)

    const scheduledAt = new Date(`${formDate}T${formTime}:00`)

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: parseInt(formDuration),
          service_type: formServiceType || null,
          notes: formNotes || null,
          customer_id: formCustomerId || null,
          vehicle_id: formVehicleId || null,
          customer_name: formCustomerName || null,
          customer_phone: formCustomerPhone || null,
        }),
      })

      if (res.ok) {
        setShowNewDialog(false)
        fetchAppointments()
      }
    } catch (err) {
      console.error('Error creating appointment:', err)
    } finally {
      setSaving(false)
    }
  }

  // ─── Update appointment status ───────────────────────

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        fetchAppointments()
        setShowDetailDialog(false)
      }
    } catch (err) {
      console.error('Error updating appointment:', err)
    } finally {
      setUpdatingStatus(false)
    }
  }

  // ─── Get appointments for a specific day column ──────

  function getAppointmentsForDay(dayOffset: number): Appointment[] {
    const day = new Date(weekStart)
    day.setDate(day.getDate() + dayOffset)
    return appointments.filter((a) => {
      const d = new Date(a.scheduled_at)
      return isSameDay(d, day)
    })
  }

  // ─── Render appointment block in the calendar grid ───

  function renderAppointmentBlock(appointment: Appointment) {
    const start = new Date(appointment.scheduled_at)
    const startHour = start.getHours()
    const startMinute = start.getMinutes()
    const minutesFromStart = (startHour - HOUR_START) * 60 + startMinute
    const topPx = (minutesFromStart / 30) * SLOT_HEIGHT
    const heightPx = (appointment.duration_minutes / 30) * SLOT_HEIGHT

    if (startHour < HOUR_START || startHour >= HOUR_END) return null

    const displayName =
      appointment.customer?.full_name ?? appointment.customer_name ?? 'ללא שם'

    return (
      <button
        key={appointment.id}
        onClick={() => openDetailDialog(appointment)}
        className={`absolute right-0.5 left-0.5 rounded-md border px-1.5 py-1 overflow-hidden text-right cursor-pointer hover:brightness-110 transition-all ${STATUS_COLORS[appointment.status]}`}
        style={{ top: `${topPx}px`, height: `${Math.max(heightPx - 2, SLOT_HEIGHT - 4)}px` }}
      >
        <p className="text-[11px] font-bold truncate">{displayName}</p>
        {heightPx >= SLOT_HEIGHT && (
          <>
            <p className="text-[10px] opacity-80 truncate">{appointment.service_type ?? ''}</p>
            <p className="text-[10px] opacity-60">{formatTime(start)}</p>
          </>
        )}
      </button>
    )
  }

  // ─── Current time line ───────────────────────────────

  function getCurrentTimeLine() {
    const now = new Date()
    const hour = now.getHours()
    const minute = now.getMinutes()
    if (hour < HOUR_START || hour >= HOUR_END) return null
    const minutesFromStart = (hour - HOUR_START) * 60 + minute
    const topPx = (minutesFromStart / 30) * SLOT_HEIGHT
    return (
      <div
        className="absolute left-0 right-0 z-20 pointer-events-none"
        style={{ top: `${topPx}px` }}
      >
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-error shrink-0 -ml-1" />
          <div className="flex-1 h-[2px] bg-error" />
        </div>
      </div>
    )
  }

  // ─── Week day columns ────────────────────────────────

  function getDayDate(dayOffset: number): Date {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + dayOffset)
    return d
  }

  return (
    <div className="min-h-full bg-surface flex flex-col">
      <Topbar
        title="לוח זמנים"
        actions={
          <Button variant="primary" size="sm" onClick={() => openNewDialog()}>
            <Plus size={14} />
            תור חדש
          </Button>
        }
      />

      {/* Week navigation */}
      <div className="sticky top-12 z-30 bg-surface border-b border-white/5 px-4 py-2">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Button variant="ghost" size="sm" onClick={goToNextWeek}>
            <ChevronLeft size={16} />
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={goToThisWeek}>
              השבוע
            </Button>
            <span className="text-sm font-bold text-on-surface">{formatWeekRange(weekStart)}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={goToPrevWeek}>
            <ChevronRight size={16} />
          </Button>
        </div>

        {/* Mobile day selector */}
        <div className="md:hidden flex gap-1 mt-2 overflow-x-auto pb-1">
          {DAYS_HE.map((day, i) => {
            const dayDate = getDayDate(i)
            const isToday = isSameDay(dayDate, today)
            return (
              <Chip
                key={i}
                active={selectedDay === i}
                onClick={() => setSelectedDay(i)}
                className={isToday ? 'ring-1 ring-primary/40' : ''}
              >
                {day} {dayDate.getDate()}
              </Chip>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* ── DESKTOP: Week View Calendar Grid ─────────── */}
          <div className="hidden md:block flex-1 overflow-auto px-4 pb-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex bg-surface-low rounded-xl overflow-hidden border border-white/5">
                {/* Time column */}
                <div className="w-[60px] shrink-0">
                  <div className="h-12 bg-surface-high border-b border-white/5" />
                  {timeSlots.map((slot, idx) => (
                    <div
                      key={slot}
                      className="h-12 flex items-start justify-center pt-0.5 text-on-surface-variant text-xs tabular-nums border-b border-white/5"
                    >
                      {idx % 2 === 0 ? slot : ''}
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {Array.from({ length: 7 }).map((_, dayIdx) => {
                  const dayDate = getDayDate(dayIdx)
                  const isToday = isSameDay(dayDate, today)
                  const dayAppointments = getAppointmentsForDay(dayIdx)

                  return (
                    <div
                      key={dayIdx}
                      className={`flex-1 min-w-0 border-r border-white/5 ${isToday ? 'bg-primary/[0.03]' : ''}`}
                    >
                      {/* Header */}
                      <div className={`h-12 bg-surface-high border-b border-white/5 flex flex-col items-center justify-center ${isToday ? 'bg-primary/5' : ''}`}>
                        <span className="text-xs font-bold text-on-surface">{DAYS_HE[dayIdx]}</span>
                        <span className={`text-[10px] leading-none ${isToday ? 'text-primary font-bold bg-primary/10 w-5 h-5 rounded-full flex items-center justify-center' : 'text-on-surface-variant'}`}>
                          {dayDate.getDate()}
                        </span>
                      </div>

                      {/* Slots */}
                      <div className="relative">
                        {timeSlots.map((slot) => (
                          <div
                            key={slot}
                            className="h-12 border-b border-white/5 cursor-pointer hover:bg-primary/5 transition-colors"
                            onClick={() => openNewDialog(dayIdx, slot)}
                          />
                        ))}
                        {/* Appointment blocks */}
                        {dayAppointments.map(renderAppointmentBlock)}
                        {/* Current time line */}
                        {isToday && getCurrentTimeLine()}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── MOBILE: Day View ───────────────────────── */}
          <div className="md:hidden flex-1 overflow-auto px-4 pb-20">
            {/* View toggle */}
            <div className="flex gap-1.5 mt-3 mb-3">
              <Chip active={mobileView === 'day'} onClick={() => setMobileView('day')}>
                <Clock size={12} />
                תצוגת יום
              </Chip>
              <Chip active={mobileView === 'list'} onClick={() => setMobileView('list')}>
                <Calendar size={12} />
                רשימה
              </Chip>
            </div>

            {mobileView === 'day' ? (
              /* Day timeline view */
              <div className="bg-surface-low rounded-xl border border-white/5 overflow-hidden">
                <div className="relative">
                  {timeSlots.map((slot, idx) => (
                    <div
                      key={slot}
                      className="flex h-12 border-b border-white/5"
                      onClick={() => openNewDialog(selectedDay, slot)}
                    >
                      <div className="w-14 shrink-0 flex items-start justify-center pt-0.5 text-on-surface-variant text-xs tabular-nums">
                        {idx % 2 === 0 ? slot : ''}
                      </div>
                      <div className="flex-1 border-r border-white/5 cursor-pointer hover:bg-primary/5 transition-colors" />
                    </div>
                  ))}
                  {/* Appointment blocks in right column */}
                  <div className="absolute top-0 right-0 left-14 bottom-0 pointer-events-none">
                    <div className="relative h-full pointer-events-auto">
                      {getAppointmentsForDay(selectedDay).map(renderAppointmentBlock)}
                      {isSameDay(getDayDate(selectedDay), today) && getCurrentTimeLine()}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* List view */
              <div className="space-y-2">
                {getAppointmentsForDay(selectedDay).length === 0 ? (
                  <div className="bg-surface-high rounded-xl p-8 text-center">
                    <Calendar size={32} className="mx-auto text-on-surface-variant/30 mb-2" />
                    <p className="text-sm text-on-surface-variant">אין תורים ביום זה</p>
                  </div>
                ) : (
                  getAppointmentsForDay(selectedDay).map((appointment) => {
                    const start = new Date(appointment.scheduled_at)
                    const displayName =
                      appointment.customer?.full_name ?? appointment.customer_name ?? 'ללא שם'
                    return (
                      <button
                        key={appointment.id}
                        onClick={() => openDetailDialog(appointment)}
                        className={`w-full text-right rounded-xl border p-4 transition-all active:scale-[0.98] ${STATUS_COLORS[appointment.status]}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold opacity-80">
                            {STATUS_LABELS[appointment.status]}
                          </span>
                          <span className="text-sm font-bold tabular-nums">
                            {formatTime(start)}
                          </span>
                        </div>
                        <p className="font-bold">{displayName}</p>
                        {appointment.service_type && (
                          <p className="text-xs opacity-70 mt-0.5">{appointment.service_type}</p>
                        )}
                        {appointment.vehicle && (
                          <p className="text-xs opacity-60 mt-0.5">
                            {appointment.vehicle.make} {appointment.vehicle.model} - {appointment.vehicle.license_plate}
                          </p>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-20 left-4 z-30">
        <button
          onClick={() => openNewDialog()}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-secondary-container shadow-[0_0_16px_rgba(232,114,12,0.3)] text-white transition-transform active:scale-95"
        >
          <Plus size={22} />
        </button>
      </div>

      {/* ── New Appointment Dialog ─────────────────────── */}
      <Dialog
        open={showNewDialog}
        onClose={() => setShowNewDialog(false)}
        title="תור חדש"
        className="md:max-w-md"
      >
        <DialogBody className="space-y-4">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="תאריך"
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
            />
            <Input
              label="שעה"
              type="time"
              value={formTime}
              onChange={(e) => setFormTime(e.target.value)}
            />
          </div>

          {/* Duration & Service Type */}
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="משך"
              value={formDuration}
              onChange={(e) => setFormDuration(e.target.value)}
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
            <Select
              label="סוג שירות"
              value={formServiceType}
              onChange={(e) => setFormServiceType(e.target.value)}
            >
              <option value="">בחר סוג</option>
              {SERVICE_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Customer autocomplete */}
          <AutocompleteInput
            label="לקוח (חיפוש)"
            placeholder="הקלד שם או טלפון..."
            value={customerSearch}
            onChange={(e) => {
              setCustomerSearch(e.target.value)
              setFormCustomerId(null)
              setFormVehicleId(null)
            }}
            suggestions={customerSuggestions}
            loading={customerLoading}
            onSelect={(suggestion) => {
              setFormCustomerId(suggestion.id)
              setCustomerSearch(suggestion.label)
              setFormCustomerName(suggestion.label)
              setFormCustomerPhone(suggestion.secondary ?? '')
            }}
          />

          {/* Vehicle select */}
          {formCustomerId && vehicles.length > 0 && (
            <Select
              label="רכב"
              value={formVehicleId ?? ''}
              onChange={(e) => setFormVehicleId(e.target.value || null)}
            >
              <option value="">בחר רכב</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </Select>
          )}

          {/* Quick fields (when no customer selected) */}
          {!formCustomerId && (
            <div className="border border-white/5 rounded-lg p-3 space-y-3 bg-surface-lowest/30">
              <p className="text-xs text-on-surface-variant font-bold">או הזן פרטים ידנית:</p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="שם לקוח"
                  placeholder="שם מלא"
                  value={formCustomerName}
                  onChange={(e) => setFormCustomerName(e.target.value)}
                />
                <Input
                  label="טלפון"
                  placeholder="050-0000000"
                  type="tel"
                  dir="ltr"
                  value={formCustomerPhone}
                  onChange={(e) => setFormCustomerPhone(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <Textarea
            label="הערות"
            placeholder="פרטים נוספים..."
            rows={2}
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowNewDialog(false)}>
            ביטול
          </Button>
          <Button variant="primary" onClick={handleCreate} loading={saving}>
            צור תור
          </Button>
        </DialogFooter>
      </Dialog>

      {/* ── Appointment Detail Dialog ──────────────────── */}
      <Dialog
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        title="פרטי תור"
        className="md:max-w-md"
      >
        {selectedAppointment && (
          <>
            <DialogBody className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLORS[selectedAppointment.status]}`}>
                  {STATUS_LABELS[selectedAppointment.status]}
                </span>
                <span className="text-xs text-on-surface-variant tabular-nums">
                  {new Date(selectedAppointment.scheduled_at).toLocaleDateString('he-IL', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </span>
              </div>

              {/* Time */}
              <div className="flex items-center gap-2 text-on-surface">
                <Clock size={16} className="text-primary shrink-0" />
                <span className="text-sm font-bold tabular-nums">
                  {formatTime(new Date(selectedAppointment.scheduled_at))}
                </span>
                <span className="text-xs text-on-surface-variant">
                  ({selectedAppointment.duration_minutes} דקות)
                </span>
              </div>

              {/* Customer */}
              <div className="flex items-center gap-2 text-on-surface">
                <User size={16} className="text-primary shrink-0" />
                <span className="text-sm font-bold">
                  {selectedAppointment.customer?.full_name ?? selectedAppointment.customer_name ?? 'ללא שם'}
                </span>
              </div>

              {/* Phone */}
              {(selectedAppointment.customer?.phone ?? selectedAppointment.customer_phone) && (
                <div className="flex items-center gap-2 text-on-surface">
                  <Phone size={16} className="text-primary shrink-0" />
                  <span className="text-sm" dir="ltr">
                    {selectedAppointment.customer?.phone ?? selectedAppointment.customer_phone}
                  </span>
                </div>
              )}

              {/* Vehicle */}
              {selectedAppointment.vehicle && (
                <div className="flex items-center gap-2 text-on-surface">
                  <Car size={16} className="text-primary shrink-0" />
                  <span className="text-sm">
                    {selectedAppointment.vehicle.make} {selectedAppointment.vehicle.model}
                  </span>
                  <span className="bg-[#F5D015] text-[#221b00] px-1.5 py-0.5 rounded-sm text-[10px] font-black font-mono">
                    {selectedAppointment.vehicle.license_plate}
                  </span>
                </div>
              )}

              {/* Service type */}
              {selectedAppointment.service_type && (
                <div className="bg-surface-lowest rounded-lg px-3 py-2">
                  <p className="text-xs text-on-surface-variant mb-0.5">סוג שירות</p>
                  <p className="text-sm font-bold text-on-surface">{selectedAppointment.service_type}</p>
                </div>
              )}

              {/* Notes */}
              {selectedAppointment.notes && (
                <div className="bg-surface-lowest rounded-lg px-3 py-2">
                  <p className="text-xs text-on-surface-variant mb-0.5">הערות</p>
                  <p className="text-sm text-on-surface">{selectedAppointment.notes}</p>
                </div>
              )}

              {/* Status change actions */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <p className="text-xs font-bold text-on-surface-variant">עדכון סטטוס:</p>
                <div className="flex flex-wrap gap-1.5">
                  {(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'] as AppointmentStatus[])
                    .filter((s) => s !== selectedAppointment.status)
                    .map((status) => (
                      <Button
                        key={status}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusChange(selectedAppointment.id, status)}
                        loading={updatingStatus}
                        className={`text-xs ${STATUS_COLORS[status]} border`}
                      >
                        {STATUS_LABELS[status]}
                      </Button>
                    ))}
                </div>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowDetailDialog(false)}>
                סגור
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </div>
  )
}
