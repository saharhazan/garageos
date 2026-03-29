import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Wrench,
  Plus,
  TrendingUp,
  Calendar,
  Star,
  ArrowLeft,
} from 'lucide-react'
import { Topbar } from '@/components/layout/topbar'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatRelative } from '@/lib/utils'
import type { WorkOrder, DashboardStats } from '@/types'

function getGreeting(name: string): string {
  const hour = new Date().getHours()
  if (hour < 12) return `בוקר טוב, ${name}`
  if (hour < 17) return `שלום, ${name}`
  if (hour < 21) return `ערב טוב, ${name}`
  return `לילה טוב, ${name}`
}

interface KpiCardProps {
  label: string
  value: string
  icon: React.ElementType
  accent?: string
  sub?: string
}

function KpiCard({ label, value, icon: Icon, accent = '#3b82f6', sub }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-4">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-[#71717a] font-medium">{label}</span>
        <div
          className="flex items-center justify-center w-7 h-7 rounded-[6px]"
          style={{ background: `${accent}18` }}
        >
          <Icon size={14} style={{ color: accent }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-[#fafafa] leading-tight">{value}</p>
      {sub && <p className="text-xs text-[#52525b] mt-1">{sub}</p>}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user profile
  const { data: profile } = await supabase
    .from('garage_users')
    .select('full_name, role')
    .eq('id', user?.id ?? '')
    .single()

  const userName = profile?.full_name?.split(' ')[0] ?? 'משתמש'

  // Fetch stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekStart = new Date(today)
  weekStart.setDate(weekStart.getDate() - 7)

  const { data: openOrders } = await supabase
    .from('work_orders')
    .select('id, status')
    .in('status', ['received', 'in_progress', 'ready'])

  const { data: weekOrders } = await supabase
    .from('work_orders')
    .select('total_amount')
    .gte('created_at', weekStart.toISOString())
    .eq('status', 'delivered')

  const weekRevenue = weekOrders?.reduce((sum, o) => sum + (o.total_amount ?? 0), 0) ?? 0
  const openCount = openOrders?.length ?? 0
  const readyCount = openOrders?.filter((o) => o.status === 'ready').length ?? 0

  // Fetch recent orders
  const { data: recentOrders } = await supabase
    .from('work_orders')
    .select('*, customer:customers(full_name, phone), vehicle:vehicles(license_plate, make, model)')
    .order('created_at', { ascending: false })
    .limit(10)

  const stats: DashboardStats = {
    open_orders: openCount,
    in_progress: openOrders?.filter((o) => o.status === 'in_progress').length ?? 0,
    ready_for_pickup: readyCount,
    completed_today: 0,
    revenue_today: 0,
    revenue_week: weekRevenue,
    revenue_month: 0,
    appointments_today: 0,
  }

  const greeting = getGreeting(userName)

  return (
    <div>
      <Topbar
        title="דשבורד"
        actions={
          <Link href="/orders/new">
            <Button variant="primary" size="sm">
              <Plus size={14} />
              עבודה חדשה
            </Button>
          </Link>
        }
      />

      <div className="px-4 py-5 max-w-5xl mx-auto space-y-6">
        {/* Greeting */}
        <div>
          <h2 className="text-xl font-semibold text-[#fafafa]">{greeting}</h2>
          <p className="text-sm text-[#71717a] mt-0.5">
            {new Date().toLocaleDateString('he-IL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard
            label="עבודות פתוחות"
            value={String(stats.open_orders)}
            icon={Wrench}
            accent="#3b82f6"
            sub={`${stats.in_progress} בטיפול פעיל`}
          />
          <KpiCard
            label="הכנסה השבוע"
            value={formatCurrency(stats.revenue_week)}
            icon={TrendingUp}
            accent="#22c55e"
          />
          <KpiCard
            label="מוכנות לאיסוף"
            value={String(stats.ready_for_pickup)}
            icon={Calendar}
            accent="#eab308"
          />
          <KpiCard
            label="שביעות רצון"
            value="4.8"
            icon={Star}
            accent="#f59e0b"
            sub="ממוצע חודשי"
          />
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2">
          <Link href="/orders/new">
            <Button variant="primary" size="default">
              <Plus size={14} />
              עבודה חדשה
            </Button>
          </Link>
          <Link href="/customers">
            <Button variant="default" size="default">
              <Plus size={14} />
              קבלת לקוח
            </Button>
          </Link>
        </div>

        {/* Recent orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#fafafa]">עבודות אחרונות</h3>
            <Link
              href="/orders"
              className="flex items-center gap-1 text-xs text-[#52525b] hover:text-[#a1a1aa] transition-colors"
            >
              הכל
              <ArrowLeft size={12} />
            </Link>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block rounded-xl border border-[#27272a] overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#27272a] bg-[#09090b]">
                  <th className="text-right px-4 h-9 text-xs font-medium text-[#52525b]">מספר</th>
                  <th className="text-right px-4 h-9 text-xs font-medium text-[#52525b]">לקוח</th>
                  <th className="text-right px-4 h-9 text-xs font-medium text-[#52525b]">רכב</th>
                  <th className="text-right px-4 h-9 text-xs font-medium text-[#52525b]">סטטוס</th>
                  <th className="text-right px-4 h-9 text-xs font-medium text-[#52525b]">סכום</th>
                  <th className="text-right px-4 h-9 text-xs font-medium text-[#52525b]">נוצר</th>
                </tr>
              </thead>
              <tbody>
                {!recentOrders || recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#52525b]">
                      אין עבודות עדיין
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order: WorkOrder) => (
                    <tr
                      key={order.id}
                      className="border-b border-[#27272a] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 h-11 font-mono text-xs text-[#3b82f6]">
                        <Link href={`/orders/${order.id}`} className="hover:underline">
                          {order.job_number}
                        </Link>
                      </td>
                      <td className="px-4 h-11 text-[#fafafa]">
                        {order.customer?.full_name ?? '—'}
                      </td>
                      <td className="px-4 h-11 text-[#a1a1aa]">
                        {order.vehicle
                          ? `${order.vehicle.license_plate} · ${order.vehicle.make} ${order.vehicle.model}`
                          : '—'}
                      </td>
                      <td className="px-4 h-11">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 h-11 text-[#a1a1aa] tabular-nums">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-4 h-11 text-xs text-[#52525b]">
                        {formatRelative(order.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden space-y-2">
            {!recentOrders || recentOrders.length === 0 ? (
              <div className="rounded-xl border border-[#27272a] bg-[#18181b] px-4 py-8 text-center">
                <p className="text-sm text-[#52525b]">אין עבודות עדיין</p>
              </div>
            ) : (
              recentOrders.map((order: WorkOrder) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block rounded-xl border border-[#27272a] bg-[#18181b] p-4 hover:border-[#3f3f46] transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono text-xs text-[#3b82f6]">{order.job_number}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-sm font-medium text-[#fafafa] mb-0.5">
                    {order.customer?.full_name ?? '—'}
                  </p>
                  <p className="text-xs text-[#52525b]">
                    {order.vehicle
                      ? `${order.vehicle.license_plate} · ${order.vehicle.make} ${order.vehicle.model}`
                      : '—'}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#27272a]">
                    <span className="text-sm font-semibold text-[#fafafa]">
                      {formatCurrency(order.total_amount)}
                    </span>
                    <span className="text-xs text-[#52525b]">
                      {formatRelative(order.created_at)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
