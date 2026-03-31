import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  MessageCircle,
  Edit3,
  Check,
  Phone,
  Mail,
  Car,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime, formatDate, PRIORITY_LABELS } from '@/lib/utils'
import { StatusButton } from './status-button'
import type { WorkOrder, OrderStatus } from '@/types'

const STATUS_FLOW: OrderStatus[] = ['received', 'in_progress', 'ready', 'delivered']
const STATUS_STEP_LABELS: Record<OrderStatus, string> = {
  received: 'התקבל',
  in_progress: 'בטיפול',
  ready: 'מוכן לאיסוף',
  delivered: 'נמסר ללקוח',
  cancelled: 'בוטל',
}

function LicensePlate({ plate }: { plate: string }) {
  return (
    <div className="bg-[#F5D015] text-black inline-flex items-center rounded-sm overflow-hidden shadow-[0_0_15px_rgba(232,196,0,0.2)] border border-black/10 h-10">
      <div className="bg-primary-container w-5 h-full flex flex-col items-center justify-center text-[8px] text-white font-bold">
        <span>IL</span>
      </div>
      <div className="px-3 text-center font-mono font-bold text-xl tracking-[0.15em] tabular-nums">{plate}</div>
    </div>
  )
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('work_orders')
    .select(
      '*, customer:customers(full_name, phone, email), vehicle:vehicles(license_plate, make, model, year, color, mileage), technician:users(full_name)'
    )
    .eq('id', id)
    .single()

  if (!order) notFound()

  const typedOrder = order as WorkOrder & {
    customer: { full_name: string; phone: string; email: string | null }
    vehicle: { license_plate: string; make: string; model: string; year: number | null; color: string | null }
    technician: { full_name: string } | null
  }

  const currentStepIndex = STATUS_FLOW.indexOf(typedOrder.status)

  const whatsappMessage = encodeURIComponent(
    `שלום ${typedOrder.customer?.full_name}, עדכון לגבי הרכב שלך ${typedOrder.vehicle?.make} ${typedOrder.vehicle?.model} (${typedOrder.vehicle?.license_plate}):\n\nסטטוס עבודה ${typedOrder.job_number}: ${STATUS_STEP_LABELS[typedOrder.status]}\n\nלפרטים נוספים צור איתנו קשר.`
  )
  const whatsappUrl = typedOrder.customer?.phone
    ? `https://wa.me/972${typedOrder.customer.phone.replace(/^0/, '').replace(/[-\s]/g, '')}?text=${whatsappMessage}`
    : '#'

  // Calculate the timeline progress width
  const progressPercent = currentStepIndex >= 0
    ? Math.min(100, (currentStepIndex / (STATUS_FLOW.length - 1)) * 100)
    : 0

  return (
    <div className="min-h-full pb-6 bg-surface">
      <Topbar
        title={typedOrder.job_number}
        backHref="/orders"
        actions={
          <Link href={`/orders/${id}/edit`}>
            <Button variant="default" size="sm">
              <Edit3 size={14} />
              <span className="hidden md:inline">עריכה</span>
            </Button>
          </Link>
        }
      />

      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="text-right">
            <div className="flex items-center gap-3 justify-end mb-2">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20 font-mono tracking-widest">
                {typedOrder.job_number}
              </span>
            </div>
            <h2 className="text-3xl font-black text-on-surface tracking-tighter">
              {typedOrder.vehicle?.make} {typedOrder.vehicle?.model}
            </h2>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-xs text-on-surface-variant">
                עדיפות: {PRIORITY_LABELS[typedOrder.priority]}
              </span>
              {typedOrder.technician && (
                <span className="text-xs text-on-surface-variant">
                  מכונאי: {typedOrder.technician.full_name}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="default" size="default">
                <MessageCircle size={14} className="text-success" />
                <span className="hidden md:inline">שלח WhatsApp</span>
              </Button>
            </a>
            <StatusButton orderId={id} currentStatus={typedOrder.status} />
          </div>
        </div>

        {/* Status Timeline */}
        {typedOrder.status !== 'cancelled' && (
          <div className="bg-surface-low rounded-xl p-8 relative overflow-hidden">
            <div className="flex justify-between items-center relative">
              {/* Progress Line Background */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-surface-highest" />
              {/* Progress Line Active */}
              <div
                className="absolute top-5 right-0 h-1 bg-primary"
                style={{ width: `${progressPercent}%` }}
              />
              {/* Steps */}
              {STATUS_FLOW.map((status, index) => {
                const isDone = index < currentStepIndex
                const isCurrent = index === currentStepIndex

                return (
                  <div key={status} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                    {isDone ? (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-[0_0_15px_rgba(143,209,217,0.4)]">
                        <Check size={18} />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-[0_0_15px_rgba(143,209,217,0.4)]">
                        <div className="w-3 h-3 rounded-full bg-on-primary" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-surface-highest border-2 border-outline-variant flex items-center justify-center text-on-surface-variant">
                        <div className="w-2 h-2 rounded-full bg-current opacity-50" />
                      </div>
                    )}
                    <span
                      className={`text-xs font-bold text-center whitespace-nowrap ${
                        isCurrent
                          ? 'text-primary'
                          : isDone
                          ? 'text-on-surface'
                          : 'text-on-surface-variant/50'
                      }`}
                    >
                      {STATUS_STEP_LABELS[status]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Work & Parts */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            {/* Items Table */}
            <div className="bg-surface-high rounded-xl overflow-hidden shadow-lg">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-black text-lg text-on-surface">פירוט עבודה וחלפים</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="text-on-surface-variant text-xs font-bold uppercase tracking-wider bg-surface-low/50">
                      <th className="px-6 py-4">תיאור פריט / עבודה</th>
                      <th className="px-6 py-4 text-center">כמות</th>
                      <th className="px-6 py-4">מחיר יחידה</th>
                      <th className="px-6 py-4 text-left">{"סה\"כ"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typedOrder.items?.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-white/[0.02] transition-colors ${
                          index % 2 === 1 ? 'bg-surface-low/30' : ''
                        }`}
                      >
                        <td className="px-6 py-5">
                          <p className="font-bold text-on-surface">{item.description}</p>
                        </td>
                        <td className="px-6 py-5 text-center tabular-nums text-on-surface-variant">{item.quantity}</td>
                        <td className="px-6 py-5 tabular-nums text-on-surface-variant">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="px-6 py-5 text-left font-bold tabular-nums text-on-surface">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="p-6 bg-surface-highest/30 border-t border-white/5 space-y-2">
                <div className="flex justify-between text-sm text-on-surface-variant">
                  <span className="tabular-nums">{formatCurrency(typedOrder.subtotal)}</span>
                  <span>{"סה\"כ לפני מע\"מ:"}</span>
                </div>
                <div className="flex justify-between text-sm text-on-surface-variant">
                  <span className="tabular-nums">{formatCurrency(typedOrder.tax_amount)}</span>
                  <span>{"מע\"מ (17%):"}</span>
                </div>
                <div className="flex justify-between text-primary font-black text-2xl mt-2 border-t border-white/10 pt-3">
                  <span className="tabular-nums">{formatCurrency(typedOrder.total_amount)}</span>
                  <span>{"סה\"כ לתשלום:"}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {typedOrder.notes && (
              <div className="bg-surface-high rounded-xl p-6 shadow-lg">
                <h3 className="font-black text-sm text-on-surface-variant mb-4 flex items-center gap-2 justify-end">
                  הערות מוסך פנימיות
                </h3>
                <p className="text-on-surface text-sm bg-surface-lowest p-4 rounded-lg border-r-4 border-secondary/50 leading-relaxed">
                  {typedOrder.notes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Vehicle + Customer */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            {/* Vehicle Card */}
            <div className="bg-surface-high rounded-xl p-6 shadow-lg border border-white/5">
              <div className="flex items-center gap-2 text-primary mb-4">
                <Car size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider">רכב</span>
              </div>
              <div className="flex flex-col gap-4">
                {/* License Plate */}
                <div className="flex justify-center py-2">
                  {typedOrder.vehicle?.license_plate && (
                    <LicensePlate plate={typedOrder.vehicle.license_plate} />
                  )}
                </div>
                <div className="text-center">
                  <h3 className="font-black text-xl text-on-surface">
                    {typedOrder.vehicle?.make} {typedOrder.vehicle?.model}
                  </h3>
                  <p className="text-sm text-on-surface-variant">
                    {typedOrder.vehicle?.year && `${typedOrder.vehicle.year}`}
                    {typedOrder.vehicle?.color && ` | ${typedOrder.vehicle.color}`}
                  </p>
                </div>
                {typedOrder.mileage && (
                  <div className="bg-surface-low p-3 rounded-lg border border-white/5">
                    <p className="text-[10px] text-on-surface-variant uppercase mb-1">{"קילומטראז' בקבלה"}</p>
                    <p className="text-lg font-bold tabular-nums text-on-surface">
                      {typedOrder.mileage.toLocaleString('he-IL')} <span className="text-xs font-normal text-on-surface-variant">{"ק\"מ"}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Card */}
            <div className="bg-surface-high rounded-xl p-6 shadow-lg border border-white/5">
              <div className="flex items-center gap-2 text-secondary mb-4">
                <Mail size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">לקוח</span>
              </div>
              <div className="space-y-4">
                <div className="text-right">
                  <h3 className="font-black text-xl text-on-surface">
                    {typedOrder.customer?.full_name ?? '-'}
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-low/50 hover:bg-surface-low transition-colors cursor-pointer">
                    <Phone size={14} className="text-on-surface-variant" />
                    <a
                      href={`tel:${typedOrder.customer?.phone}`}
                      className="text-sm font-bold tabular-nums text-primary hover:underline"
                      dir="ltr"
                    >
                      {typedOrder.customer?.phone ?? '-'}
                    </a>
                  </div>
                  {typedOrder.customer?.email && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-low/50 hover:bg-surface-low transition-colors cursor-pointer">
                      <Mail size={14} className="text-on-surface-variant" />
                      <a
                        href={`mailto:${typedOrder.customer.email}`}
                        className="text-sm font-bold text-primary hover:underline"
                        dir="ltr"
                      >
                        {typedOrder.customer.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-on-surface-variant">
          <div className="bg-surface-high rounded-lg p-3">
            <span className="block mb-0.5 text-on-surface-variant/50 uppercase text-[10px] font-bold tracking-wider">נוצר</span>
            <span>{formatDateTime(typedOrder.created_at)}</span>
          </div>
          <div className="bg-surface-high rounded-lg p-3">
            <span className="block mb-0.5 text-on-surface-variant/50 uppercase text-[10px] font-bold tracking-wider">עודכן</span>
            <span>{formatDateTime(typedOrder.updated_at)}</span>
          </div>
          {typedOrder.completed_at && (
            <div className="bg-surface-high rounded-lg p-3">
              <span className="block mb-0.5 text-on-surface-variant/50 uppercase text-[10px] font-bold tracking-wider">הושלם</span>
              <span>{formatDate(typedOrder.completed_at)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
