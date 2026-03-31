import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getApiAuth } from '@/lib/api-auth'
import { buildStatusMessage } from '@/lib/notifications'
import type { OrderStatus, GarageSettings } from '@/types'

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
      customer:customers(id, full_name, phone),
      vehicle:vehicles(id, license_plate)
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
    .select('name, settings')
    .eq('id', profile.garageId)
    .single()

  if (garageError || !garage) {
    return NextResponse.json({ error: 'מוסך לא נמצא' }, { status: 404 })
  }

  const settings = garage.settings as GarageSettings
  const customerRaw = order.customer as unknown
  const vehicleRaw = order.vehicle as unknown
  const customer = (Array.isArray(customerRaw) ? customerRaw[0] : customerRaw) as { id: string; full_name: string; phone: string } | null
  const vehicle = (Array.isArray(vehicleRaw) ? vehicleRaw[0] : vehicleRaw) as { id: string; license_plate: string } | null

  if (!customer || !vehicle) {
    return NextResponse.json({ error: 'נתוני לקוח/רכב חסרים' }, { status: 400 })
  }

  // Only notify if auto-notify is enabled and a channel is configured
  if (!settings.auto_notify_on_status_change) {
    return NextResponse.json({ data: { skipped: true, reason: 'auto_notify disabled' } })
  }

  if (!settings.sms_enabled && !settings.whatsapp_enabled) {
    return NextResponse.json({ data: { skipped: true, reason: 'no channel configured' } })
  }

  const message = buildStatusMessage(body.status, vehicle.license_plate, garage.name)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  let notificationStatus: 'sent' | 'failed' = 'failed'
  let channelUsed: 'sms' | 'whatsapp' = 'sms'

  // Prefer WhatsApp if enabled
  if (settings.whatsapp_enabled) {
    channelUsed = 'whatsapp'
    const res = await fetch(`${baseUrl}/api/whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: customer.phone, message }),
    })
    notificationStatus = res.ok ? 'sent' : 'failed'
  } else if (settings.sms_enabled) {
    channelUsed = 'sms'
    const res = await fetch(`${baseUrl}/api/sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: customer.phone, message }),
    })
    notificationStatus = res.ok ? 'sent' : 'failed'
  }

  // Log notification to DB
  await supabase.from('notifications').insert({
    garage_id: profile.garageId,
    order_id: body.orderId,
    type: channelUsed,
    recipient: customer.phone,
    message,
    status: notificationStatus,
    sent_at: notificationStatus === 'sent' ? new Date().toISOString() : null,
  })

  return NextResponse.json({
    data: {
      sent: notificationStatus === 'sent',
      channel: channelUsed,
      recipient: customer.phone,
    },
  })
}
