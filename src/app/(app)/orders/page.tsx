'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { StatusBadge } from '@/components/ui/status-badge'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { formatCurrency, formatDate, STATUS_LABELS } from '@/lib/utils'
import { exportToExcel } from '@/lib/excel-export'
import type { WorkOrder, OrderStatus } from '@/types'

const STATUS_FILTERS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'הכל', value: 'all' },
  { label: 'התקבל', value: 'received' },
  { label: 'בטיפול', value: 'in_progress' },
  { label: 'מוכן', value: 'ready' },
  { label: 'נמסר', value: 'delivered' },
]

const PRIORITY_LABEL: Record<string, { label: string; color: string }> = {
  normal: { label: 'רגיל', color: '#bfc8c9' },
  high: { label: 'גבוה', color: '#e8c400' },
  urgent: { label: 'דחוף', color: '#ffb4ab' },
}

function LicensePlate({ plate }: { plate: string }) {
  return (
    <div className="bg-[#F5D015] text-black w-28 h-8 rounded-sm flex items-center overflow-hidden shadow-[0_0_15px_rgba(232,196,0,0.2)] mx-auto border border-black/10">
      <div className="bg-primary-container w-4 h-full flex flex-col items-center justify-center text-[8px] text-white">
        <span>IL</span>
      </div>
      <div className="flex-grow text-center font-mono font-bold text-lg tracking-widest tabular-nums">{plate}</div>
    </div>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [page, setPage] = useState(0)
  const [exporting, setExporting] = useState(false)
  const PAGE_SIZE = 20

  async function handleExport() {
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
          customer_phone: (cust as Record<string, unknown>)?.phone ?? '',
          vehicle: veh ? `${(veh as Record<string, unknown>).make ?? ''} ${(veh as Record<string, unknown>).model ?? ''}` : '',
          license_plate: (veh as Record<string, unknown>)?.license_plate ?? '',
          status: STATUS_LABELS[o.status as string] ?? o.status ?? '',
          total_amount: o.total_amount ?? 0,
          created_at: o.created_at ? formatDate(o.created_at as string) : '',
        }
      })

      const today = new Date().toISOString().slice(0, 10)
      exportToExcel(rows, [
        { key: 'job_number', label: 'מספר עבודה' },
        { key: 'customer_name', label: 'לקוח' },
        { key: 'customer_phone', label: 'טלפון' },
        { key: 'vehicle', label: 'רכב' },
        { key: 'license_plate', label: 'לוחית' },
        { key: 'status', label: 'סטטוס' },
        { key: 'total_amount', label: 'סכום' },
        { key: 'created_at', label: 'תאריך' },
      ], `orders-${today}.xlsx`)
    } catch (err) {
      console.error('Export error:', err)
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => {
    setPage(0)
  }, [search, statusFilter])

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true)
      const supabase = createClient()
      let query = supabase
        .from('work_orders')
        .select(
          '*, customer:customers(full_name, phone), vehicle:vehicles(license_plate, make, model)'
        )
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      if (search.trim()) {
        query = query.or(
          `job_number.ilike.%${search}%,vehicle.license_plate.ilike.%${search}%,customer.full_name.ilike.%${search}%`
        )
      }

      const { data } = await query
      setOrders(data ?? [])
      setLoading(false)
    }
    fetchOrders()
  }, [statusFilter, search, page])

  return (
    <div className="min-h-full bg-surface">
      <Topbar
        title="עבודות"
        actions={
          <div className="flex items-center gap-1.5">
            <Button variant="default" size="sm" onClick={handleExport} disabled={exporting} loading={exporting}>
              <Download size={14} />
              ייצוא לאקסל
            </Button>
            <Link href="/orders/new">
              <Button variant="primary" size="sm">
                <Plus size={14} />
                עבודה חדשה
              </Button>
            </Link>
          </div>
        }
      />

      <div className="px-4 py-4 max-w-6xl mx-auto space-y-4">
        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
          />
          <input
            type="search"
            placeholder="חפש לפי לוחית, שם, מספר עבודה..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-outline-variant/20 bg-surface-lowest pr-9 pl-3 text-sm text-on-surface placeholder:text-outline outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        {/* Status filter chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4">
          {STATUS_FILTERS.map((f) => (
            <Chip
              key={f.value}
              active={statusFilter === f.value}
              onClick={() => setStatusFilter(f.value)}
              className="shrink-0"
            >
              {f.label}
            </Chip>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {/* Desktop table */}
        {!loading && (
          <>
            <div className="hidden md:block bg-surface-low rounded-xl overflow-hidden shadow-2xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>מספר</TableHead>
                    <TableHead>לקוח</TableHead>
                    <TableHead>רכב</TableHead>
                    <TableHead className="text-center">לוחית</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead>עדיפות</TableHead>
                    <TableHead>סכום</TableHead>
                    <TableHead>תאריך</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-on-surface-variant">
                        {search ? 'לא נמצאו תוצאות לחיפוש' : 'אין עבודות עדיין'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => {
                      const priority = PRIORITY_LABEL[order.priority] ?? PRIORITY_LABEL.normal
                      return (
                        <TableRow key={order.id} className="cursor-pointer">
                          <TableCell>
                            <Link
                              href={`/orders/${order.id}`}
                              className="font-mono text-sm text-primary font-medium hover:underline"
                            >
                              {order.job_number}
                            </Link>
                          </TableCell>
                          <TableCell className="text-on-surface font-medium">
                            {order.customer?.full_name ?? '-'}
                          </TableCell>
                          <TableCell>
                            {order.vehicle
                              ? `${order.vehicle.make} ${order.vehicle.model}`
                              : '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            {order.vehicle?.license_plate ? (
                              <LicensePlate plate={order.vehicle.license_plate} />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={order.status} />
                          </TableCell>
                          <TableCell>
                            <span
                              className="text-xs font-bold"
                              style={{ color: priority.color }}
                            >
                              {priority.label}
                            </span>
                          </TableCell>
                          <TableCell className="tabular-nums text-on-surface font-bold">
                            {formatCurrency(order.total_amount)}
                          </TableCell>
                          <TableCell className="text-xs text-on-surface-variant">
                            {formatDate(order.created_at)}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {orders.length === 0 ? (
                <div className="rounded-xl bg-surface-high px-4 py-12 text-center">
                  <p className="text-sm text-on-surface-variant">
                    {search ? 'לא נמצאו תוצאות' : 'אין עבודות עדיין'}
                  </p>
                </div>
              ) : (
                orders.map((order) => {
                  const priority = PRIORITY_LABEL[order.priority] ?? PRIORITY_LABEL.normal
                  return (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="block rounded-xl bg-surface-high p-4 hover:bg-surface-highest transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs text-primary font-medium">
                          {order.job_number}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {order.priority !== 'normal' && (
                            <span
                              className="text-[10px] font-bold"
                              style={{ color: priority.color }}
                            >
                              {priority.label}
                            </span>
                          )}
                          <StatusBadge status={order.status} />
                        </div>
                      </div>
                      <p className="text-sm font-bold text-on-surface mb-1">
                        {order.customer?.full_name ?? '-'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        {order.vehicle && (
                          <>
                            <span className="bg-[#F5D015] text-[#221b00] px-1.5 py-0.5 rounded-sm text-[10px] font-black font-mono flex items-center">
                              <span className="w-1.5 h-3 bg-primary-container mr-1 rounded-px" />
                              {order.vehicle.license_plate}
                            </span>
                            <span>{order.vehicle.make} {order.vehicle.model}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                        <span className="text-sm font-bold text-on-surface tabular-nums">
                          {formatCurrency(order.total_amount)}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          {formatDate(order.created_at)}
                        </span>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>

            {/* Pagination */}
            {orders.length > 0 && (
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  הקודם
                </Button>
                <span className="text-xs text-on-surface-variant">עמוד {page + 1}</span>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={orders.length < PAGE_SIZE}
                >
                  הבא
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-20 left-4 z-30">
        <Link href="/orders/new">
          <button className="flex items-center justify-center w-14 h-14 rounded-full bg-secondary-container shadow-[0_0_16px_rgba(232,114,12,0.3)] text-white transition-transform active:scale-95">
            <Plus size={22} />
          </button>
        </Link>
      </div>
    </div>
  )
}
