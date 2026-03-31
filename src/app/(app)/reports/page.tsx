'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  ClipboardList,
  Calculator,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Users,
  Wrench,
  HardHat,
  Download,
} from 'lucide-react'
import { Topbar } from '@/components/layout/topbar'
import { Chip } from '@/components/ui/chip'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatCurrency, STATUS_LABELS } from '@/lib/utils'
import { exportToExcel } from '@/lib/excel-export'

// ─── Types ─────────────────────────────────────────────

interface ReportsData {
  revenue: number
  revenueChange: number
  orderCount: number
  orderCountChange: number
  avgPerOrder: number
  newCustomers: number
  newCustomersChange: number
  dailyRevenue: { date: string; value: number }[]
  statusBreakdown: { status: string; count: number }[]
  topCustomers: { id: string; name: string; orders: number; revenue: number }[]
  topItems: { description: string; count: number; revenue: number }[]
  technicianStats: { id: string; name: string; orders: number; revenue: number; avgPerOrder: number }[]
}

type Preset = 'today' | 'week' | 'month' | 'last_month' | 'year' | 'custom'

// ─── Date helpers ──────────────────────────────────────

function getPresetRange(preset: Preset): { from: Date; to: Date } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  switch (preset) {
    case 'today':
      return { from: today, to: tomorrow }
    case 'week': {
      // Start of current week (Sunday)
      const weekStart = new Date(today)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      return { from: weekStart, to: tomorrow }
    }
    case 'month': {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      return { from: monthStart, to: tomorrow }
    }
    case 'last_month': {
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 1)
      return { from: lastMonthStart, to: lastMonthEnd }
    }
    case 'year': {
      const yearStart = new Date(today.getFullYear(), 0, 1)
      return { from: yearStart, to: tomorrow }
    }
    default:
      return { from: today, to: tomorrow }
  }
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function formatHebrewDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

// ─── Status colors for breakdown bars ──────────────────

const STATUS_COLORS: Record<string, string> = {
  received: 'bg-primary',
  in_progress: 'bg-secondary-container',
  ready: 'bg-success',
  delivered: 'bg-on-surface-variant',
  cancelled: 'bg-error',
}

const STATUS_DOT_COLORS: Record<string, string> = {
  received: 'bg-primary',
  in_progress: 'bg-secondary',
  ready: 'bg-success',
  delivered: 'bg-on-surface-variant',
  cancelled: 'bg-error',
}

// ─── Components ────────────────────────────────────────

function ChangeIndicator({ value }: { value: number }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant">
        <Minus size={12} />
        <span>0%</span>
      </span>
    )
  }
  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold bg-success/10 text-success px-2 py-0.5 rounded-full">
        <TrendingUp size={12} />
        <span>+{value}%</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold bg-error/10 text-error px-2 py-0.5 rounded-full">
      <TrendingDown size={12} />
      <span>{value}%</span>
    </span>
  )
}

function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
  change,
}: {
  label: string
  value: string
  icon: React.ElementType
  accent: 'primary' | 'secondary' | 'tertiary'
  change?: number
}) {
  const accentStyles = {
    primary: { border: 'border-primary', iconBg: 'bg-primary/10', iconText: 'text-primary' },
    secondary: { border: 'border-secondary', iconBg: 'bg-secondary/10', iconText: 'text-secondary' },
    tertiary: { border: 'border-tertiary', iconBg: 'bg-tertiary/10', iconText: 'text-tertiary' },
  }
  const styles = accentStyles[accent]

  return (
    <div className={`bg-surface-high p-5 rounded-xl border-b-4 ${styles.border} shadow-lg hover:bg-surface-highest transition-all`}>
      <div className="flex justify-between items-start mb-3">
        <div className={`w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center ${styles.iconText}`}>
          <Icon size={18} />
        </div>
        {change !== undefined && <ChangeIndicator value={change} />}
      </div>
      <div className="space-y-0.5">
        <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">{label}</span>
        <h2 className="text-3xl font-black tracking-tighter tabular-nums text-on-surface">{value}</h2>
      </div>
    </div>
  )
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="flex items-end gap-1 h-48 overflow-x-auto pb-1">
      {data.map((d, i) => (
        <div key={i} className="flex-1 min-w-[20px] flex flex-col items-center gap-1 group">
          <span className="text-[10px] text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity tabular-nums whitespace-nowrap">
            {formatCurrency(d.value)}
          </span>
          <div
            className="w-full bg-primary-container rounded-t transition-all group-hover:bg-primary"
            style={{
              height: `${(d.value / max) * 100}%`,
              minHeight: d.value > 0 ? '4px' : '0',
            }}
          />
          <span className="text-[9px] text-on-surface-variant/60 truncate w-full text-center">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  )
}

function StatusBreakdown({ data }: { data: { status: string; count: number }[] }) {
  const totalOrders = data.reduce((sum, d) => sum + d.count, 0)
  if (totalOrders === 0) {
    return <p className="text-sm text-on-surface-variant text-center py-6">אין נתונים</p>
  }

  const sorted = [...data].sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-3">
      {sorted.map((d) => {
        const pct = Math.round((d.count / totalOrders) * 100)
        return (
          <div key={d.status}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[d.status] ?? 'bg-outline'}`} />
                <span className="text-sm text-on-surface font-bold">
                  {STATUS_LABELS[d.status] ?? d.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm tabular-nums text-on-surface">{d.count}</span>
                <span className="text-xs tabular-nums text-on-surface-variant w-10 text-left">
                  {pct}%
                </span>
              </div>
            </div>
            <div className="w-full h-2 bg-surface-highest rounded-full overflow-hidden">
              <div
                className={`h-full ${STATUS_COLORS[d.status] ?? 'bg-outline'} rounded-full transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────

export default function ReportsPage() {
  const [preset, setPreset] = useState<Preset>('month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [data, setData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  async function handleExportReport() {
    setExporting(true)
    try {
      const res = await fetch('/api/export?type=orders')
      const json = await res.json()
      if (!res.ok || !json.data) return

      const rows = json.data.map((o: Record<string, unknown>) => {
        const cust = Array.isArray(o.customer) ? o.customer[0] : o.customer
        const veh = Array.isArray(o.vehicle) ? o.vehicle[0] : o.vehicle
        return {
          job_number: o.job_number ?? '',
          customer_name: (cust as Record<string, unknown>)?.full_name ?? '',
          vehicle: veh ? `${(veh as Record<string, unknown>).make ?? ''} ${(veh as Record<string, unknown>).model ?? ''}` : '',
          license_plate: (veh as Record<string, unknown>)?.license_plate ?? '',
          status: STATUS_LABELS[o.status as string] ?? o.status ?? '',
          total_amount: o.total_amount ?? 0,
          created_at: o.created_at ?? '',
        }
      })

      const today = new Date().toISOString().slice(0, 10)
      exportToExcel(rows, [
        { key: 'job_number', label: 'מספר עבודה' },
        { key: 'customer_name', label: 'לקוח' },
        { key: 'vehicle', label: 'רכב' },
        { key: 'license_plate', label: 'לוחית' },
        { key: 'status', label: 'סטטוס' },
        { key: 'total_amount', label: 'סכום' },
        { key: 'created_at', label: 'תאריך' },
      ], `report-${today}.xlsx`)
    } catch (err) {
      console.error('Report export error:', err)
    } finally {
      setExporting(false)
    }
  }

  const getDateRange = useCallback((): { from: string; to: string } => {
    if (preset === 'custom' && customFrom && customTo) {
      const toDate = new Date(customTo)
      toDate.setDate(toDate.getDate() + 1)
      return { from: new Date(customFrom).toISOString(), to: toDate.toISOString() }
    }
    const range = getPresetRange(preset)
    return { from: range.from.toISOString(), to: range.to.toISOString() }
  }, [preset, customFrom, customTo])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { from, to } = getDateRange()
      const res = await fetch(`/api/reports?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'שגיאה בטעינת דוח')
      }
      const json = await res.json()
      setData(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת דוח')
    } finally {
      setLoading(false)
    }
  }, [getDateRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Date range display
  const rangeDisplay = (() => {
    if (preset === 'custom' && customFrom && customTo) {
      return `${formatHebrewDate(customFrom)} - ${formatHebrewDate(customTo)}`
    }
    const range = getPresetRange(preset)
    return `${formatHebrewDate(toISODate(range.from))} - ${formatHebrewDate(toISODate(range.to))}`
  })()

  const presets: { key: Preset; label: string }[] = [
    { key: 'today', label: 'היום' },
    { key: 'week', label: 'השבוע' },
    { key: 'month', label: 'החודש' },
    { key: 'last_month', label: 'חודש שעבר' },
    { key: 'year', label: 'שנה' },
    { key: 'custom', label: 'מותאם' },
  ]

  // Chart data from daily revenue
  const chartData = (data?.dailyRevenue ?? []).map((d) => ({
    label: formatShortDate(d.date),
    value: d.value,
  }))

  return (
    <div className="min-h-full bg-surface">
      <Topbar
        title="דוחות"
        actions={
          <div className="flex items-center gap-1.5">
            <Button variant="default" size="sm" onClick={handleExportReport} disabled={exporting} loading={exporting}>
              <Download size={14} />
              ייצוא דוח
            </Button>
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center w-8 h-8 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
              title="הדפסה"
            >
              <Download size={16} />
            </button>
          </div>
        }
      />

      <div className="px-4 py-6 max-w-7xl mx-auto space-y-6">
        {/* ── Date Range Picker ── */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {presets.map((p) => (
              <Chip
                key={p.key}
                active={preset === p.key}
                onClick={() => setPreset(p.key)}
              >
                {p.label}
              </Chip>
            ))}
          </div>

          {preset === 'custom' && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-xs text-on-surface-variant font-bold">מתאריך</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="bg-surface-high border border-white/10 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-on-surface-variant font-bold">עד תאריך</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="bg-surface-high border border-white/10 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>
          )}

          <p className="text-xs text-on-surface-variant">{rangeDisplay}</p>
        </div>

        {/* ── Loading / Error ── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        )}

        {error && (
          <div className="bg-error/10 border border-error/20 rounded-xl p-4 text-center">
            <p className="text-sm text-error font-bold">{error}</p>
            <button
              onClick={fetchData}
              className="mt-2 text-xs text-error underline hover:no-underline"
            >
              נסה שוב
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <KpiCard
                label="הכנסות"
                value={formatCurrency(data.revenue)}
                icon={DollarSign}
                accent="primary"
                change={data.revenueChange}
              />
              <KpiCard
                label="כרטיסי עבודה"
                value={String(data.orderCount)}
                icon={ClipboardList}
                accent="secondary"
                change={data.orderCountChange}
              />
              <KpiCard
                label="ממוצע לכרטיס"
                value={data.avgPerOrder > 0 ? formatCurrency(data.avgPerOrder) : '-'}
                icon={Calculator}
                accent="tertiary"
              />
              <KpiCard
                label="לקוחות חדשים"
                value={String(data.newCustomers)}
                icon={UserPlus}
                accent="primary"
                change={data.newCustomersChange}
              />
            </div>

            {/* ── Revenue Chart + Status Breakdown ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Revenue Chart */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <BarChart3 size={16} className="text-primary" />
                      <CardTitle>הכנסות יומיות</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {chartData.length === 0 ? (
                      <p className="text-sm text-on-surface-variant text-center py-10">אין נתונים</p>
                    ) : (
                      <BarChart data={chartData} />
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Status Breakdown */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <ClipboardList size={16} className="text-secondary" />
                      <CardTitle>פילוח לפי סטטוס</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <StatusBreakdown data={data.statusBreakdown} />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ── Top Customers + Top Services ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Top Customers */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-primary" />
                    <CardTitle>לקוחות מובילים</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {data.topCustomers.length === 0 ? (
                    <p className="text-sm text-on-surface-variant text-center py-8">אין נתונים</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">#</TableHead>
                          <TableHead>לקוח</TableHead>
                          <TableHead className="text-center">הזמנות</TableHead>
                          <TableHead>הכנסות</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.topCustomers.map((c, i) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-bold text-on-surface-variant">{i + 1}</TableCell>
                            <TableCell>
                              <Link
                                href={`/customers/${c.id}`}
                                className="text-on-surface font-bold hover:text-primary transition-colors"
                              >
                                {c.name}
                              </Link>
                            </TableCell>
                            <TableCell className="text-center tabular-nums">{c.orders}</TableCell>
                            <TableCell className="font-bold tabular-nums text-on-surface">
                              {formatCurrency(c.revenue)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Top Services */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Wrench size={16} className="text-secondary" />
                    <CardTitle>שירותים מובילים</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {data.topItems.length === 0 ? (
                    <p className="text-sm text-on-surface-variant text-center py-8">אין נתונים</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>תיאור</TableHead>
                          <TableHead className="text-center">כמות</TableHead>
                          <TableHead>הכנסות</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.topItems.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-on-surface font-medium max-w-[200px] truncate">
                              {item.description}
                            </TableCell>
                            <TableCell className="text-center tabular-nums">{item.count}</TableCell>
                            <TableCell className="font-bold tabular-nums text-on-surface">
                              {formatCurrency(item.revenue)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Technician Performance ── */}
            {data.technicianStats.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <HardHat size={16} className="text-tertiary" />
                    <CardTitle>ביצועי מכונאים</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Desktop table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>מכונאי</TableHead>
                          <TableHead className="text-center">כרטיסי עבודה</TableHead>
                          <TableHead>הכנסות</TableHead>
                          <TableHead>ממוצע לכרטיס</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.technicianStats.map((tech) => (
                          <TableRow key={tech.id}>
                            <TableCell className="font-bold text-on-surface">{tech.name}</TableCell>
                            <TableCell className="text-center tabular-nums">{tech.orders}</TableCell>
                            <TableCell className="font-bold tabular-nums text-on-surface">
                              {formatCurrency(tech.revenue)}
                            </TableCell>
                            <TableCell className="tabular-nums text-on-surface-variant">
                              {formatCurrency(tech.avgPerOrder)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden divide-y divide-white/5">
                    {data.technicianStats.map((tech) => (
                      <div key={tech.id} className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-on-surface">{tech.name}</span>
                          <span className="text-sm font-bold tabular-nums text-on-surface">
                            {formatCurrency(tech.revenue)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                          <span>{tech.orders} כרטיסים</span>
                          <span>ממוצע: {formatCurrency(tech.avgPerOrder)}</span>
                        </div>
                        {/* Mini bar showing relative performance */}
                        <div className="w-full h-1.5 bg-surface-highest rounded-full overflow-hidden">
                          <div
                            className="h-full bg-tertiary rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (tech.revenue / Math.max(...data.technicianStats.map((t) => t.revenue), 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
