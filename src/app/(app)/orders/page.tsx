'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
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
import { formatCurrency, formatDate } from '@/lib/utils'
import type { WorkOrder, OrderStatus } from '@/types'

const STATUS_FILTERS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'הכל', value: 'all' },
  { label: 'התקבל', value: 'received' },
  { label: 'בטיפול', value: 'in_progress' },
  { label: 'מוכן', value: 'ready' },
  { label: 'נמסר', value: 'delivered' },
]

const PRIORITY_LABEL: Record<string, { label: string; color: string }> = {
  normal: { label: 'רגיל', color: '#52525b' },
  high: { label: 'גבוה', color: '#eab308' },
  urgent: { label: 'דחוף', color: '#ef4444' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 20

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
    <div className="min-h-full">
      <Topbar
        title="עבודות"
        actions={
          <Link href="/orders/new">
            <Button variant="primary" size="sm">
              <Plus size={14} />
              עבודה חדשה
            </Button>
          </Link>
        }
      />

      <div className="px-4 py-4 max-w-6xl mx-auto space-y-4">
        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] pointer-events-none"
          />
          <input
            type="search"
            placeholder="חפש לפי לוחית, שם, מספר עבודה..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-[6px] border border-[#27272a] bg-[#09090b] pr-9 pl-3 text-sm text-[#fafafa] placeholder:text-[#52525b] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-500/10 transition-all"
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
            <div className="hidden md:block rounded-xl border border-[#27272a] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>מספר</TableHead>
                    <TableHead>לקוח</TableHead>
                    <TableHead>רכב</TableHead>
                    <TableHead>לוחית</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead>עדיפות</TableHead>
                    <TableHead>סכום</TableHead>
                    <TableHead>תאריך</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-[#52525b]">
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
                              className="font-mono text-xs text-[#3b82f6] hover:underline"
                            >
                              {order.job_number}
                            </Link>
                          </TableCell>
                          <TableCell className="text-[#fafafa] font-medium">
                            {order.customer?.full_name ?? '—'}
                          </TableCell>
                          <TableCell>
                            {order.vehicle
                              ? `${order.vehicle.make} ${order.vehicle.model}`
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs bg-[#27272a] px-1.5 py-0.5 rounded">
                              {order.vehicle?.license_plate ?? '—'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={order.status} />
                          </TableCell>
                          <TableCell>
                            <span
                              className="text-xs font-medium"
                              style={{ color: priority.color }}
                            >
                              {priority.label}
                            </span>
                          </TableCell>
                          <TableCell className="tabular-nums text-[#fafafa]">
                            {formatCurrency(order.total_amount)}
                          </TableCell>
                          <TableCell className="text-xs">
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
            <div className="md:hidden space-y-2">
              {orders.length === 0 ? (
                <div className="rounded-xl border border-[#27272a] bg-[#18181b] px-4 py-12 text-center">
                  <p className="text-sm text-[#52525b]">
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
                      className="block rounded-xl border border-[#27272a] bg-[#18181b] p-4 hover:border-[#3f3f46] transition-colors active:bg-white/[0.02]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs text-[#3b82f6]">
                          {order.job_number}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {order.priority !== 'normal' && (
                            <span
                              className="text-[10px] font-semibold"
                              style={{ color: priority.color }}
                            >
                              {priority.label}
                            </span>
                          )}
                          <StatusBadge status={order.status} />
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-[#fafafa] mb-0.5">
                        {order.customer?.full_name ?? '—'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[#52525b]">
                        {order.vehicle && (
                          <>
                            <span className="font-mono bg-[#27272a] px-1.5 py-0.5 rounded">
                              {order.vehicle.license_plate}
                            </span>
                            <span>{order.vehicle.make} {order.vehicle.model}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#27272a]">
                        <span className="text-sm font-bold text-[#fafafa]">
                          {formatCurrency(order.total_amount)}
                        </span>
                        <span className="text-xs text-[#52525b]">
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
                <span className="text-xs text-[#52525b]">עמוד {page + 1}</span>
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
          <button className="flex items-center justify-center w-12 h-12 rounded-full bg-[#3b82f6] shadow-lg shadow-blue-500/30 text-white transition-transform active:scale-95">
            <Plus size={20} />
          </button>
        </Link>
      </div>
    </div>
  )
}
