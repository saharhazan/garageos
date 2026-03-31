import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Phone,
  Mail,
  Car,
  Edit3,
  Plus,
  FileText,
  User,
  ClipboardList,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DeleteCustomerButton } from './delete-button'
import type { OrderStatus } from '@/types'

// ─── License Plate (Israeli yellow style) ─────────────────
function LicensePlate({ plate }: { plate: string }) {
  return (
    <div className="bg-[#F5D015] text-black inline-flex items-center rounded-sm overflow-hidden shadow-[0_0_15px_rgba(232,196,0,0.2)] border border-black/10 h-8">
      <div className="bg-primary-container w-4 h-full flex flex-col items-center justify-center text-[7px] text-white font-bold">
        <span>IL</span>
      </div>
      <div className="px-2 text-center font-mono font-bold text-sm tracking-[0.12em] tabular-nums">
        {plate}
      </div>
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────
function SectionHeader({
  icon: Icon,
  label,
  action,
}: {
  icon: typeof Car
  label: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-primary" />
        <h2 className="font-black text-on-surface uppercase tracking-widest text-xs">
          {label}
        </h2>
      </div>
      {action}
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch customer with vehicles
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*, vehicles(*)')
    .eq('id', id)
    .single()

  if (customerError || !customer) notFound()

  // Fetch work orders for this customer
  const { data: orders } = await supabase
    .from('work_orders')
    .select('*, vehicle:vehicles(license_plate, make, model)')
    .eq('customer_id', id)
    .order('created_at', { ascending: false })

  const vehicles = customer.vehicles ?? []
  const workOrders = orders ?? []

  const initials = customer.full_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-full pb-6 bg-surface">
      <Topbar
        title={customer.full_name}
        backHref="/customers"
        actions={
          <div className="flex gap-2">
            <DeleteCustomerButton customerId={id} />
            <Link href={`/customers/${id}/edit`}>
              <Button variant="default" size="sm">
                <Edit3 size={14} />
                <span className="hidden md:inline">עריכה</span>
              </Button>
            </Link>
          </div>
        }
      />

      <div className="px-4 py-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-12 gap-6">
          {/* ─── Left Column: Customer Info + Vehicles ──────── */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            {/* Customer Info Card */}
            <div className="bg-surface-high rounded-xl p-6 shadow-lg border border-white/5">
              <SectionHeader icon={User} label="פרטי לקוח" />

              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-container/15 border-2 border-primary/20">
                  <span className="text-xl font-black text-primary">{initials}</span>
                </div>
                <h2 className="text-2xl font-black text-on-surface tracking-tight">
                  {customer.full_name}
                </h2>
              </div>

              <div className="space-y-3">
                {/* Phone */}
                <a
                  href={`tel:${customer.phone}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-low/50 hover:bg-surface-low transition-colors"
                >
                  <Phone size={14} className="text-on-surface-variant" />
                  <span className="text-sm font-bold tabular-nums text-primary" dir="ltr">
                    {customer.phone}
                  </span>
                </a>

                {/* Email */}
                {customer.email && (
                  <a
                    href={`mailto:${customer.email}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-low/50 hover:bg-surface-low transition-colors"
                  >
                    <Mail size={14} className="text-on-surface-variant" />
                    <span className="text-sm font-bold text-primary" dir="ltr">
                      {customer.email}
                    </span>
                  </a>
                )}
              </div>

              {/* Notes */}
              {customer.notes && (
                <div className="mt-4 p-3 rounded-lg bg-surface-lowest border-r-4 border-secondary/50">
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">
                    הערות
                  </p>
                  <p className="text-sm text-on-surface leading-relaxed">
                    {customer.notes}
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-on-surface-variant">
                  לקוח מאז {formatDate(customer.created_at)}
                </p>
              </div>
            </div>

            {/* Vehicles Card */}
            <div className="bg-surface-high rounded-xl p-6 shadow-lg border border-white/5">
              <SectionHeader
                icon={Car}
                label="כלי רכב"
                action={
                  <Link href={`/vehicles/new?customer_id=${id}`}>
                    <Button variant="ghost" size="sm">
                      <Plus size={14} />
                      הוסף רכב
                    </Button>
                  </Link>
                }
              />

              {vehicles.length === 0 ? (
                <div className="text-center py-8">
                  <Car size={32} className="mx-auto text-outline-variant mb-3 opacity-40" />
                  <p className="text-sm text-outline mb-3">אין כלי רכב רשומים</p>
                  <Link href={`/vehicles/new?customer_id=${id}`}>
                    <Button variant="teal" size="sm">
                      <Plus size={14} />
                      הוסף רכב ראשון
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicles.map((vehicle: {
                    id: string
                    license_plate: string
                    make: string
                    model: string
                    year: number | null
                    color: string | null
                  }) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-surface-low/50 hover:bg-surface-low transition-colors"
                    >
                      <LicensePlate plate={vehicle.license_plate} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-on-surface truncate">
                          {vehicle.make} {vehicle.model}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {vehicle.year && (
                            <span className="text-xs text-on-surface-variant">{vehicle.year}</span>
                          )}
                          {vehicle.color && (
                            <span className="text-xs text-on-surface-variant">
                              | {vehicle.color}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── Right Column: Order History ────────────────── */}
          <div className="col-span-12 lg:col-span-7">
            <div className="bg-surface-high rounded-xl shadow-lg border border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <SectionHeader
                  icon={ClipboardList}
                  label="היסטוריית הזמנות"
                  action={
                    <Link href={`/orders/new?customer_id=${id}`}>
                      <Button variant="teal" size="sm">
                        <Plus size={14} />
                        הזמנה חדשה
                      </Button>
                    </Link>
                  }
                />
              </div>

              {workOrders.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <FileText size={36} className="mx-auto text-outline-variant mb-3 opacity-40" />
                  <p className="text-sm text-outline mb-3">אין הזמנות עדיין</p>
                  <Link href={`/orders/new?customer_id=${id}`}>
                    <Button variant="teal" size="sm">
                      <Plus size={14} />
                      צור הזמנה ראשונה
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Desktop: Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-right">
                      <thead>
                        <tr className="text-on-surface-variant text-xs font-bold uppercase tracking-wider bg-surface-low/50">
                          <th className="px-6 py-4">מס׳ הזמנה</th>
                          <th className="px-6 py-4">רכב</th>
                          <th className="px-6 py-4">סטטוס</th>
                          <th className="px-6 py-4">סכום</th>
                          <th className="px-6 py-4">תאריך</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {workOrders.map((order: {
                          id: string
                          job_number: string
                          status: OrderStatus
                          total_amount: number
                          created_at: string
                          vehicle: { license_plate: string; make: string; model: string } | null
                        }) => (
                          <tr
                            key={order.id}
                            className="hover:bg-primary/5 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <Link
                                href={`/orders/${order.id}`}
                                className="font-mono font-bold text-sm text-primary hover:underline"
                              >
                                {order.job_number}
                              </Link>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-on-surface">
                                {order.vehicle
                                  ? `${order.vehicle.make} ${order.vehicle.model}`
                                  : '-'}
                              </span>
                              {order.vehicle && (
                                <span className="block text-xs text-on-surface-variant font-mono mt-0.5">
                                  {order.vehicle.license_plate}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={order.status} />
                            </td>
                            <td className="px-6 py-4 tabular-nums text-sm text-on-surface font-bold">
                              {formatCurrency(order.total_amount)}
                            </td>
                            <td className="px-6 py-4 text-sm text-on-surface-variant">
                              {formatDate(order.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile: Card View */}
                  <div className="md:hidden divide-y divide-white/5">
                    {workOrders.map((order: {
                      id: string
                      job_number: string
                      status: OrderStatus
                      total_amount: number
                      created_at: string
                      vehicle: { license_plate: string; make: string; model: string } | null
                    }) => (
                      <Link
                        key={order.id}
                        href={`/orders/${order.id}`}
                        className="flex flex-col gap-2 p-4 hover:bg-primary/5 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <StatusBadge status={order.status} />
                          <span className="font-mono font-bold text-sm text-primary">
                            {order.job_number}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm tabular-nums font-bold text-on-surface">
                            {formatCurrency(order.total_amount)}
                          </span>
                          <span className="text-sm text-on-surface">
                            {order.vehicle
                              ? `${order.vehicle.make} ${order.vehicle.model}`
                              : '-'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-on-surface-variant">
                            {formatDate(order.created_at)}
                          </span>
                          {order.vehicle && (
                            <span className="text-xs text-on-surface-variant font-mono">
                              {order.vehicle.license_plate}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {/* Order count */}
              {workOrders.length > 0 && (
                <div className="px-6 py-3 border-t border-white/5 bg-surface-low/30">
                  <p className="text-xs text-outline text-center">
                    {workOrders.length} הזמנות
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
