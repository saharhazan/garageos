import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getApiAuth } from '@/lib/api-auth'
import { buildStatusMessage } from '@/lib/notifications'
import { buildStatusEmailHtml, getStatusEmailSubject } from '@/lib/email-templates'
import type { OrderItem } from '@/types'
import type { OrderStatus, GarageSettings, GarageBusinessDetails } from '@/types'

export async function POST(request: NextRequest) {
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  const supabase = await createClient()

  let body: { orderId: string; status: OrderStatus }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  if (!body.orderId || !body.status) {
    return NextResponse.json({ error: 'חסרים שדות: orderId, status' }, { status: 400 })
  }

  // Fetch order with customer and vehicle — verify it belongs to this garage
  const { data: order, error: orderError } = await supabase
    .from('work_orders')
    .select(
      `
      id,
      garage_id,
      job_number,
      items,
      total_amount,
      customer:customers(id, full_name, phone, email),
      vehicle:vehicles(id, license_plate, make, model)
      `
    )
    .eq('id', body.orderId)
    .eq('garage_id', profile.garageId)
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'הזמנה לא נמצאה' }, { status: 404 })
  }

  // Fetch garage settings
  const { data: garage, error: garageError } = await supabase
    .from('garages')
    .select('name, address, phone, settings, business_details')
    .eq('id', profile.garageId)
    .single()

  if (garageError || !garage) {
    return NextResponse.json({ error: 'מוסך לא נמצא' }, { status: 404 })
  }

  const settings = garage.settings as GarageSettings
  const businessDetails = (garage.business_details ?? {}) as GarageBusinessDetails
  const customerRaw = order.customer as unknown
  const vehicleRaw = order.vehicle as unknown
  const customer = (Array.isArray(customerRaw) ? customerRaw[0] : customerRaw) as { id: string; full_name: string; phone: string; email?: string | null } | null
  const vehicle = (Array.isArray(vehicleRaw) ? vehicleRaw[0] : vehicleRaw) as { id: string; license_plate: string; make?: string; model?: string } | null

  if (!customer || !vehicle) {
    return NextResponse.json({ error: 'נתוני לקוח/רכב חסרים' }, { status: 400 })
  }

  // Only notify if auto-notify is enabled and a channel is configured
  if (!settings.auto_notify_on_status_change) {
    return NextResponse.json({ data: { skipped: true, reason: 'auto_notify disabled' } })
  }

  if (!settings.sms_enabled && !settings.whatsapp_enabled && !settings.email_enabled) {
    return NextResponse.json({ data: { skipped: true, reason: 'no channel configured' } })
  }

  const message = buildStatusMessage(body.status, vehicle.license_plate, garage.name)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const results: { channel: string; status: 'sent' | 'failed'; recipient: string }[] = []

  // SMS / WhatsApp notifications (prefer WhatsApp)
  if (settings.whatsapp_enabled) {
    const res = await fetch(`${baseUrl}/api/whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: customer.phone, message }),
    }).catch(() => null)
    results.push({
      channel: 'whatsapp',
      status: res?.ok ? 'sent' : 'failed',
      recipient: customer.phone,
    })
  } else if (settings.sms_enabled) {
    const res = await fetch(`${baseUrl}/api/sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: customer.phone, message }),
    }).catch(() => null)
    results.push({
      channel: 'sms',
      status: res?.ok ? 'sent' : 'failed',
      recipient: customer.phone,
    })
  }

  // Email notification
  if (settings.email_enabled && customer.email) {
    const subject = getStatusEmailSubject(body.status, garage.name)
    const html = buildStatusEmailHtml(body.status, {
      garageName: garage.name,
      garageAddress: businessDetails.address ?? garage.address ?? undefined,
      garagePhone: businessDetails.phone ?? garage.phone ?? undefined,
      garageLogo: businessDetails.logo_url ?? undefined,
      customerName: customer.full_name,
      jobNumber: order.job_number,
      vehicleMake: vehicle.make ?? undefined,
      vehicleModel: vehicle.model ?? undefined,
      vehiclePlate: vehicle.license_plate,
      items: (order.items as OrderItem[]) ?? [],
      totalAmount: order.total_amount ?? undefined,
    })

    const res = await fetch(`${baseUrl}/api/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: customer.email, subject, html }),
    }).catch(() => null)
    results.push({
      channel: 'email',
      status: res?.ok ? 'sent' : 'failed',
      recipient: customer.email,
    })
  }

  // Log all notifications to DB
  for (const r of results) {
    await supabase.from('notifications').insert({
      garage_id: profile.garageId,
      order_id: body.orderId,
      type: r.channel,
      recipient: r.recipient,
      message: r.channel === 'email' ? `[Email] ${getStatusEmailSubject(body.status, garage.name)}` : message,
      status: r.status,
      sent_at: r.status === 'sent' ? new Date().toISOString() : null,
    })
  }

  // Primary result is the first channel that succeeded, or the first result
  const primaryResult = results.find((r) => r.status === 'sent') ?? results[0]

  return NextResponse.json({
    data: {
      sent: primaryResult?.status === 'sent',
      channel: primaryResult?.channel ?? 'none',
      recipient: primaryResult?.recipient ?? '',
      channels: results,
    },
  })
}
