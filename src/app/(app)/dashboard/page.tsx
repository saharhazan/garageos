import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Wrench,
  Plus,
  TrendingUp,
  ArrowLeft,
  DollarSign,
  Key,
  QrCode,
  Package,
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
  accent: 'primary' | 'secondary' | 'tertiary'
  trend?: string
  sub?: string
}

function KpiCard({ label, value, icon: Icon, accent, trend, sub }: KpiCardProps) {
  const accentStyles = {
    primary: {
      border: 'border-primary',
      iconBg: 'bg-primary/10',
      iconText: 'text-primary',
    },
    secondary: {
      border: 'border-secondary',
      iconBg: 'bg-secondary/10',
      iconText: 'text-secondary',
    },
    tertiary: {
      border: 'border-tertiary',
      iconBg: 'bg-tertiary/10',
      iconText: 'text-tertiary',
    },
  }

  const styles = accentStyles[accent]

  return (
    <div className={`bg-surface-high p-6 rounded-xl border-b-4 ${styles.border} shadow-lg hover:bg-surface-highest transition-all group`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center ${styles.iconText}`}>
          <Icon size={20} />
        </div>
        {trend && (
          <span className="text-xs font-bold bg-success/10 text-success px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">{label}</span>
        <div className="flex items-baseline gap-2">
          <h2 className="text-4xl font-black tracking-tighter tabular-nums text-on-surface">{value}</h2>
          {sub && <span className="text-sm text-on-surface-variant">{sub}</span>}
        </div>
      </div>
    </div>
  )
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
    <div className="bg-surface min-h-full">
      <Topbar
        title="לוח בקרה"
        actions={
          <Link href="/orders/new">
            <Button variant="primary" size="sm">
              <Plus size={14} />
              עבודה חדשה
            </Button>
          </Link>
        }
      />

      <div className="px-4 py-6 max-w-7xl mx-auto space-y-8">
        {/* Greeting */}
        <div>
          <h2 className="text-xl font-black text-on-surface tracking-tight">{greeting}</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {new Date().toLocaleDateString('he-IL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>

        {/* KPI Grid (Instrument Panel Gauges) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiCard
            label="הכנסות השבוע"
            value={formatCurrency(stats.revenue_week)}
            icon={DollarSign}
            accent="primary"
            trend="+12%"
          />
          <KpiCard
            label="עבודות פתוחות"
            value={String(stats.open_orders)}
            icon={Wrench}
            accent="secondary"
            sub={`${stats.in_progress} בטיפול פעיל`}
          />
          <KpiCard
            label="ממתינים לאיסוף"
            value={String(stats.ready_for_pickup)}
            icon={Key}
            accent="tertiary"
            sub="רכבים"
          />
        </div>

        {/* Dashboard Layout: Recent Orders & Quick Actions */}
        <div className="grid grid-cols-12 gap-6">
          {/* Recent Orders Table (Primary Area) */}
          <div className="col-span-12 lg:col-span-9 bg-surface-low rounded-xl overflow-hidden shadow-2xl">
            <div className="p-6 flex flex-row-reverse justify-between items-center bg-surface-high/50">
              <h3 className="font-black text-xl text-on-surface">עבודות אחרונות</h3>
              <Link
                href="/orders"
                className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors"
              >
                הכל
                <ArrowLeft size={12} />
              </Link>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="text-on-surface-variant text-xs uppercase tracking-wider font-bold border-b border-white/5">
                    <th className="px-6 py-4">מס' עבודה</th>
                    <th className="px-6 py-4">לקוח</th>
                    <th className="px-6 py-4">רכב</th>
                    <th className="px-6 py-4 text-center">לוחית רישוי</th>
                    <th className="px-6 py-4">סטטוס</th>
                    <th className="px-6 py-4">סה"כ</th>
                    <th className="px-6 py-4">נוצר</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {!recentOrders || recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                        אין עבודות עדיין
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order: WorkOrder) => (
                      <tr
                        key={order.id}
                        className="hover:bg-primary/5 transition-colors"
                      >
                        <td className="px-6 py-5 font-mono text-sm text-primary font-medium">
                          <Link href={`/orders/${order.id}`} className="hover:underline">
                            {order.job_number}
                          </Link>
                        </td>
                        <td className="px-6 py-5 text-on-surface font-medium">
                          {order.customer?.full_name ?? '-'}
                        </td>
                        <td className="px-6 py-5 text-on-surface-variant text-sm">
                          {order.vehicle
                            ? `${order.vehicle.make} ${order.vehicle.model}`
                            : '-'}
                        </td>
                        <td className="px-6 py-5">
                          {order.vehicle?.license_plate ? (
                            <LicensePlate plate={order.vehicle.license_plate} />
                          ) : (
                            <span className="text-on-surface-variant">-</span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-5 font-bold tabular-nums text-on-surface">
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td className="px-6 py-5 text-xs text-on-surface-variant">
                          {formatRelative(order.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-3 p-4">
              {!recentOrders || recentOrders.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <p className="text-sm text-on-surface-variant">אין עבודות עדיין</p>
                </div>
              ) : (
                recentOrders.map((order: WorkOrder) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="block bg-surface-high rounded-xl p-4 hover:bg-surface-highest transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-mono text-xs text-primary font-medium">{order.job_number}</span>
                      <StatusBadge status={order.status} />
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
                        {formatRelative(order.created_at)}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions & Diagnostics Panel */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-surface-high rounded-xl p-6 shadow-lg border border-white/5 relative overflow-hidden group">
              <h4 className="font-black text-lg mb-4 flex items-center gap-2 text-on-surface">
                <TrendingUp size={18} className="text-secondary" />
                פעולות מהירות
              </h4>
              <div className="space-y-3">
                <Link href="/orders/new" className="block">
                  <button className="w-full bg-primary-container text-white p-4 rounded-lg flex flex-row-reverse items-center justify-between machined-button hover:brightness-110 active:scale-95 transition-all font-bold">
                    <Plus size={18} />
                    <span>כרטיס עבודה חדש</span>
                  </button>
                </Link>
                <button className="w-full bg-surface-highest text-on-surface p-4 rounded-lg flex flex-row-reverse items-center justify-between border border-outline-variant/30 hover:border-primary/50 active:scale-95 transition-all font-bold">
                  <QrCode size={18} />
                  <span>סרוק רכב</span>
                </button>
                <Link href="/customers" className="block">
                  <button className="w-full bg-surface-highest text-on-surface p-4 rounded-lg flex flex-row-reverse items-center justify-between border border-outline-variant/30 hover:border-primary/50 active:scale-95 transition-all font-bold">
                    <Package size={18} />
                    <span>בדיקת מלאי</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Workshop Health Card */}
            <div className="bg-primary-container/10 rounded-xl p-6 border border-primary-container/30">
              <h4 className="font-black text-sm text-primary uppercase tracking-widest mb-4">ביצועי מוסך</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="tabular-nums">85%</span>
                    <span className="text-on-surface-variant">נצילות ליפטים</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[85%] shadow-[0_0_8px_rgba(143,209,217,0.5)]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="tabular-nums">62%</span>
                    <span className="text-on-surface-variant">עמידה בזמנים</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-highest rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-[62%] shadow-[0_0_8px_rgba(232,114,12,0.5)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
