import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  MessageCircle,
  FileDown,
  Edit3,
  CheckCircle2,
  Circle,
  ArrowRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDateTime, formatDate, PRIORITY_LABELS } from '@/lib/utils'
import type { WorkOrder, OrderStatus } from '@/types'

const STATUS_FLOW: OrderStatus[] = ['received', 'in_progress', 'ready', 'delivered']
const STATUS_STEP_LABELS: Record<OrderStatus, string> = {
  received: 'התקבל',
  in_progress: 'בטיפול',
  ready: 'מוכן לאיסוף',
  delivered: 'נמסר ללקוח',
  cancelled: 'בוטל',
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  received: 'in_progress',
  in_progress: 'ready',
  ready: 'delivered',
}

const NEXT_STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  received: 'התחל טיפול',
  in_progress: 'סמן כמוכן',
  ready: 'מסור ללקוח',
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
      '*, customer:customers(full_name, phone, email), vehicle:vehicles(license_plate, make, model, year, color, mileage), technician:garage_users(full_name)'
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
  const nextStatus = NEXT_STATUS[typedOrder.status]
  const nextLabel = NEXT_STATUS_LABEL[typedOrder.status]

  const whatsappMessage = encodeURIComponent(
    `שלום ${typedOrder.customer?.full_name}, עדכון לגבי הרכב שלך ${typedOrder.vehicle?.make} ${typedOrder.vehicle?.model} (${typedOrder.vehicle?.license_plate}):\n\nסטטוס עבודה ${typedOrder.job_number}: ${STATUS_STEP_LABELS[typedOrder.status]}\n\nלפרטים נוספים צור איתנו קשר.`
  )
  const whatsappUrl = typedOrder.customer?.phone
    ? `https://wa.me/972${typedOrder.customer.phone.replace(/^0/, '').replace(/[-\s]/g, '')}?text=${whatsappMessage}`
    : '#'

  return (
    <div className="min-h-full pb-6">
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

      <div className="px-4 py-5 max-w-3xl mx-auto space-y-4">
        {/* Header card */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-[#fafafa]">
                    {typedOrder.vehicle?.make} {typedOrder.vehicle?.model}
                  </h2>
                  <span className="font-mono text-sm bg-[#27272a] px-2 py-0.5 rounded text-[#a1a1aa]">
                    {typedOrder.vehicle?.license_plate}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <StatusBadge status={typedOrder.status} />
                  <span className="text-xs text-[#52525b]">
                    עדיפות: {PRIORITY_LABELS[typedOrder.priority]}
                  </span>
                  {typedOrder.technician && (
                    <span className="text-xs text-[#52525b]">
                      טכנאי: {typedOrder.technician.full_name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {nextStatus && nextLabel && (
                  <form action={`/api/orders/${id}/status`} method="POST">
                    <input type="hidden" name="status" value={nextStatus} />
                    <Button variant="primary" size="default" type="submit">
                      <ArrowRight size={14} />
                      {nextLabel}
                    </Button>
                  </form>
                )}
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="default" size="default">
                    <MessageCircle size={14} />
                    <span className="hidden md:inline">WhatsApp</span>
                  </Button>
                </a>
                <Button variant="default" size="default">
                  <FileDown size={14} />
                  <span className="hidden md:inline">PDF</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        {typedOrder.status !== 'cancelled' && (
          <Card>
            <CardHeader>
              <CardTitle>מעקב סטטוס</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-0 overflow-x-auto">
                {STATUS_FLOW.map((status, index) => {
                  const isDone = index < currentStepIndex
                  const isCurrent = index === currentStepIndex
                  const isLast = index === STATUS_FLOW.length - 1

                  return (
                    <div key={status} className="flex items-center flex-1 min-w-0">
                      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                        {isDone ? (
                          <CheckCircle2 size={20} className="text-[#22c55e]" />
                        ) : isCurrent ? (
                          <div className="w-5 h-5 rounded-full bg-[#3b82f6] flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        ) : (
                          <Circle size={20} className="text-[#3f3f46]" />
                        )}
                        <span
                          className={`text-[10px] font-medium text-center whitespace-nowrap ${
                            isCurrent
                              ? 'text-[#3b82f6]'
                              : isDone
                              ? 'text-[#22c55e]'
                              : 'text-[#52525b]'
                          }`}
                        >
                          {STATUS_STEP_LABELS[status]}
                        </span>
                      </div>
                      {!isLast && (
                        <div
                          className={`flex-1 h-px mx-2 ${
                            isDone ? 'bg-[#22c55e]/40' : 'bg-[#27272a]'
                          }`}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {/* Customer info */}
          <Card>
            <CardHeader>
              <CardTitle>פרטי לקוח</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-[#52525b]">שם</p>
                  <p className="text-sm text-[#fafafa] font-medium">
                    {typedOrder.customer?.full_name ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#52525b]">טלפון</p>
                  <a
                    href={`tel:${typedOrder.customer?.phone}`}
                    className="text-sm text-[#3b82f6] hover:underline"
                    dir="ltr"
                  >
                    {typedOrder.customer?.phone ?? '—'}
                  </a>
                </div>
                {typedOrder.customer?.email && (
                  <div>
                    <p className="text-xs text-[#52525b]">אימייל</p>
                    <a
                      href={`mailto:${typedOrder.customer.email}`}
                      className="text-sm text-[#3b82f6] hover:underline"
                      dir="ltr"
                    >
                      {typedOrder.customer.email}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Vehicle info */}
          <Card>
            <CardHeader>
              <CardTitle>פרטי רכב</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-[#52525b]">לוחית רישוי</p>
                  <p className="text-sm text-[#fafafa] font-mono font-bold tracking-widest">
                    {typedOrder.vehicle?.license_plate ?? '—'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-[#52525b]">יצרן / דגם</p>
                    <p className="text-sm text-[#fafafa]">
                      {typedOrder.vehicle?.make} {typedOrder.vehicle?.model}
                    </p>
                  </div>
                  {typedOrder.vehicle?.year && (
                    <div>
                      <p className="text-xs text-[#52525b]">שנה</p>
                      <p className="text-sm text-[#fafafa]">{typedOrder.vehicle.year}</p>
                    </div>
                  )}
                </div>
                {typedOrder.mileage && (
                  <div>
                    <p className="text-xs text-[#52525b]">קילומטראז' בקבלה</p>
                    <p className="text-sm text-[#fafafa]">
                      {typedOrder.mileage.toLocaleString('he-IL')} ק"מ
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items table */}
        <Card>
          <CardHeader>
            <CardTitle>עבודות ופריטים</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#27272a]">
                    <th className="text-right px-4 py-3 text-xs font-medium text-[#52525b]">תיאור</th>
                    <th className="text-center px-3 py-3 text-xs font-medium text-[#52525b] w-16">כמות</th>
                    <th className="text-center px-3 py-3 text-xs font-medium text-[#52525b] w-24">מחיר יחידה</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#52525b] w-24">סה"כ</th>
                  </tr>
                </thead>
                <tbody>
                  {typedOrder.items?.map((item) => (
                    <tr key={item.id} className="border-b border-[#27272a] last:border-0">
                      <td className="px-4 py-3 text-[#fafafa]">{item.description}</td>
                      <td className="px-3 py-3 text-center text-[#a1a1aa]">{item.quantity}</td>
                      <td className="px-3 py-3 text-center text-[#a1a1aa] tabular-nums">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-4 py-3 text-[#fafafa] font-medium tabular-nums">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t border-[#27272a] px-4 py-3 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#71717a]">סכום ביניים</span>
                <span className="text-[#fafafa] tabular-nums">
                  {formatCurrency(typedOrder.subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#71717a]">מע"מ 17%</span>
                <span className="text-[#fafafa] tabular-nums">
                  {formatCurrency(typedOrder.tax_amount)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#27272a]">
                <span className="text-sm font-semibold text-[#fafafa]">סה"כ לתשלום</span>
                <span className="text-base font-bold text-[#fafafa] tabular-nums">
                  {formatCurrency(typedOrder.total_amount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {typedOrder.notes && (
          <Card>
            <CardHeader>
              <CardTitle>הערות</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#a1a1aa] whitespace-pre-wrap">{typedOrder.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3 text-xs text-[#52525b]">
          <div>
            <span className="block mb-0.5 text-[#3f3f46]">נוצר</span>
            <span>{formatDateTime(typedOrder.created_at)}</span>
          </div>
          <div>
            <span className="block mb-0.5 text-[#3f3f46]">עודכן</span>
            <span>{formatDateTime(typedOrder.updated_at)}</span>
          </div>
          {typedOrder.completed_at && (
            <div>
              <span className="block mb-0.5 text-[#3f3f46]">הושלם</span>
              <span>{formatDate(typedOrder.completed_at)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
