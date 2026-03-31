import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getApiAuth } from '@/lib/api-auth'
import type { AppointmentStatus } from '@/types'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  const supabase = await createClient()

  let body: Partial<{
    scheduled_at: string
    duration_minutes: number
    service_type: string | null
    notes: string | null
    status: AppointmentStatus
    customer_id: string | null
    vehicle_id: string | null
    customer_name: string | null
    customer_phone: string | null
  }>

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}

  if (body.scheduled_at !== undefined) updates.scheduled_at = body.scheduled_at
  if (body.duration_minutes !== undefined) updates.duration_minutes = body.duration_minutes
  if (body.service_type !== undefined) updates.service_type = body.service_type
  if (body.notes !== undefined) updates.notes = body.notes
  if (body.status !== undefined) updates.status = body.status
  if (body.customer_id !== undefined) updates.customer_id = body.customer_id
  if (body.vehicle_id !== undefined) updates.vehicle_id = body.vehicle_id
  if (body.customer_name !== undefined) updates.customer_name = body.customer_name
  if (body.customer_phone !== undefined) updates.customer_phone = body.customer_phone

  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .eq('garage_id', profile.garageId)
    .select(
      `
      *,
      customer:customers(id, full_name, phone),
      vehicle:vehicles(id, license_plate, make, model)
      `
    )
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'תור לא נמצא' }, { status: 404 })
    }
    console.error('Error updating appointment:', error)
    return NextResponse.json({ error: 'שגיאה בעדכון תור' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  if (!['super_admin', 'manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'אין הרשאה למחוק תורים' }, { status: 403 })
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)
    .eq('garage_id', profile.garageId)

  if (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json({ error: 'שגיאה במחיקת תור' }, { status: 500 })
  }

  return NextResponse.json({ data: { success: true } })
}
