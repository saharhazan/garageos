import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Check, Phone, MapPin } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { OrderStatus, OrderItem, GarageBusinessDetails } from '@/types'
import type { Metadata } from 'next'

const STATUS_FLOW: OrderStatus[] = ['received', 'in_progress', 'ready', 'delivered']
const STATUS_LABELS: Record<OrderStatus, string> = {
  received: 'התקבל',
  in_progress: 'בטיפול',
  ready: 'מוכן לאיסוף',
  delivered: 'נמסר',
  cancelled: 'בוטל',
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function LicensePlate({ plate }: { plate: string }) {
  return (
    <div className="bg-[#F5D015] text-black inline-flex items-center rounded-sm overflow-hidden shadow-[0_0_15px_rgba(232,196,0,0.2)] border border-black/10 h-10">
      <div className="bg-[#0d5c63] w-5 h-full flex flex-col items-center justify-center text-[8px] text-white font-bold">
        <span>IL</span>
      </div>
      <div className="px-3 text-center font-mono font-bold text-xl tracking-[0.15em] tabular-nums">{plate}</div>
    </div>
  )
}

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = getServiceClient()

  const { data: order } = await supabase
    .from('work_orders')
    .select('job_number, garage_id')
    .eq('id', id)
    .single()

  if (!order) {
    return { title: 'הזמנה לא נמצאה | GarageOS' }
  }

  const { data: garage } = await supabase
    .from('garages')
    .select('name')
    .eq('id', order.garage_id)
    .single()

  return {
    title: `סטטוס הזמנה ${order.job_number} | ${garage?.name ?? 'GarageOS'}`,
    description: `מעקב אחר סטטוס הזמנת עבודה ${order.job_number}`,
  }
}

export default async function StatusPage({ params }: PageProps) {
  const { id } = await params
  const supabase = getServiceClient()

  // Fetch order with vehicle
  const { data: order } = await supabase
    .from('work_orders')
    .select('id, job_number, status, items, notes, updated_at, created_at, garage_id, vehicle_id')
    .eq('id', id)
    .single()

  if (!order) notFound()

  // Fetch garage and vehicle in parallel
  const [garageResult, vehicleResult] = await Promise.all([
    supabase
      .from('garages')
      .select('name, phone, address, business_details')
      .eq('id', order.garage_id)
      .single(),
    supabase
      .from('vehicles')
      .select('license_plate, make, model, year')
      .eq('id', order.vehicle_id)
      .single(),
  ])

  const garage = garageResult.data
  const vehicle = vehicleResult.data
  const businessDetails = (garage?.business_details || {}) as GarageBusinessDetails

  const garageName = businessDetails.legal_name || garage?.name || 'מוסך'
  const garagePhone = businessDetails.phone || garage?.phone
  const garageAddress = businessDetails.address || garage?.address
  const logoUrl = businessDetails.logo_url

  const currentStepIndex = STATUS_FLOW.indexOf(order.status as OrderStatus)
  const isCancelled = order.status === 'cancelled'

  const items = (order.items || []) as OrderItem[]

  return (
    <div
      className="min-h-screen"
      dir="rtl"
      style={{
        background: '#121414',
        fontFamily: 'Heebo, system-ui, sans-serif',
        color: '#e2e2e2',
      }}
    >
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Garage Header */}
        <div className="text-center space-y-3">
          {logoUrl && (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt={garageName}
                className="h-16 w-auto object-contain rounded-lg"
              />
            </div>
          )}
          <h1
            className="text-2xl font-black tracking-tight"
            style={{ color: '#e2e2e2' }}
          >
            {garageName}
          </h1>
        </div>

        {/* Title + Job Number */}
        <div className="text-center space-y-2">
          <h2
            className="text-lg font-bold"
            style={{ color: '#bfc8c9' }}
          >
            {"סטטוס הזמנת עבודה"}
          </h2>
          <span
            className="inline-block px-4 py-1.5 rounded-full text-sm font-bold font-mono tracking-widest border"
            style={{
              background: 'rgba(143,209,217,0.1)',
              color: '#8fd1d9',
              borderColor: 'rgba(143,209,217,0.2)',
            }}
          >
            {order.job_number}
          </span>
        </div>

        {/* Status Timeline */}
        {!isCancelled ? (
          <div
            className="rounded-xl p-6"
            style={{ background: '#1a1c1c' }}
          >
            <div className="flex justify-between items-start relative">
              {/* Progress Line Background */}
              <div
                className="absolute top-5 left-0 right-0 h-1 rounded-full"
                style={{ background: '#333535' }}
              />
              {/* Progress Line Active */}
              <div
                className="absolute top-5 right-0 h-1 rounded-full transition-all duration-700"
                style={{
                  background: '#8fd1d9',
                  width: `${currentStepIndex >= 0 ? Math.min(100, (currentStepIndex / (STATUS_FLOW.length - 1)) * 100) : 0}%`,
                  boxShadow: '0 0 12px rgba(143,209,217,0.4)',
                }}
              />
              {/* Steps */}
              {STATUS_FLOW.map((status, index) => {
                const isDone = index < currentStepIndex
                const isCurrent = index === currentStepIndex

                return (
                  <div key={status} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                    {isDone ? (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background: '#8fd1d9',
                          color: '#121414',
                          boxShadow: '0 0 15px rgba(143,209,217,0.4)',
                        }}
                      >
                        <Check size={18} strokeWidth={3} />
                      </div>
                    ) : isCurrent ? (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center animate-pulse"
                        style={{
                          background: '#8fd1d9',
                          color: '#121414',
                          boxShadow: '0 0 20px rgba(143,209,217,0.6)',
                        }}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ background: '#121414' }}
                        />
                      </div>
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center border-2"
                        style={{
                          background: '#333535',
                          borderColor: '#282a2a',
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full opacity-40"
                          style={{ background: '#bfc8c9' }}
                        />
                      </div>
                    )}
                    <span
                      className="text-[11px] font-bold text-center whitespace-nowrap"
                      style={{
                        color: isCurrent
                          ? '#8fd1d9'
                          : isDone
                          ? '#e2e2e2'
                          : 'rgba(191,200,201,0.4)',
                      }}
                    >
                      {STATUS_LABELS[status]}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Current Status Text */}
            <div className="mt-6 text-center">
              <p
                className="text-sm font-bold"
                style={{ color: '#8fd1d9' }}
              >
                {currentStepIndex >= 0 && STATUS_LABELS[STATUS_FLOW[currentStepIndex]]}
              </p>
            </div>
          </div>
        ) : (
          <div
            className="rounded-xl p-6 text-center border"
            style={{
              background: 'rgba(255,180,171,0.05)',
              borderColor: 'rgba(255,180,171,0.2)',
            }}
          >
            <p className="font-bold text-lg" style={{ color: '#ffb4ab' }}>
              ההזמנה בוטלה
            </p>
          </div>
        )}

        {/* Vehicle Info */}
        {vehicle && (
          <div
            className="rounded-xl p-5 border"
            style={{ background: '#282a2a', borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <div className="flex flex-col items-center gap-3">
              {vehicle.license_plate && (
                <LicensePlate plate={vehicle.license_plate} />
              )}
              <div className="text-center">
                <h3 className="font-black text-lg" style={{ color: '#e2e2e2' }}>
                  {vehicle.make} {vehicle.model}
                </h3>
                {vehicle.year && (
                  <p className="text-sm" style={{ color: '#bfc8c9' }}>
                    {vehicle.year}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Items Summary (descriptions only, no prices) */}
        {items.length > 0 && (
          <div
            className="rounded-xl overflow-hidden border"
            style={{ background: '#282a2a', borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <div
              className="px-5 py-4 border-b"
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <h3 className="font-black text-sm" style={{ color: '#e2e2e2' }}>
                {"פירוט עבודות"}
              </h3>
            </div>
            <ul className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              {items.map((item, index) => (
                <li
                  key={item.id || index}
                  className="px-5 py-3 flex items-center gap-3"
                  style={{ borderColor: 'rgba(255,255,255,0.03)' }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: '#8fd1d9' }}
                  />
                  <span className="text-sm" style={{ color: '#e2e2e2' }}>
                    {item.description}
                  </span>
                  {item.quantity > 1 && (
                    <span
                      className="text-xs mr-auto"
                      style={{ color: '#bfc8c9' }}
                    >
                      x{item.quantity}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-center">
          <p className="text-xs" style={{ color: '#bfc8c9' }}>
            {"עודכן לאחרונה: "}
            {formatDate(order.updated_at)}
          </p>
        </div>

        {/* Garage Contact Info */}
        {(garagePhone || garageAddress) && (
          <div
            className="rounded-xl p-5 border space-y-3"
            style={{ background: '#1a1c1c', borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <h4 className="font-bold text-xs uppercase tracking-widest" style={{ color: '#bfc8c9' }}>
              {"יצירת קשר"}
            </h4>
            {garagePhone && (
              <a
                href={`tel:${garagePhone}`}
                className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <Phone size={16} style={{ color: '#8fd1d9' }} />
                <span className="text-sm font-bold" dir="ltr" style={{ color: '#8fd1d9' }}>
                  {garagePhone}
                </span>
              </a>
            )}
            {garageAddress && (
              <div
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <MapPin size={16} style={{ color: '#bfc8c9' }} />
                <span className="text-sm" style={{ color: '#bfc8c9' }}>
                  {garageAddress}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
          <a
            href="https://garageos.co.il"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors"
            style={{ color: 'rgba(191,200,201,0.5)' }}
          >
            {"מופעל על ידי "}
            <span className="font-bold" style={{ color: '#8fd1d9' }}>GarageOS</span>
          </a>
        </div>
      </div>
    </div>
  )
}
