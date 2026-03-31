import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getApiAuth } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const week = searchParams.get('week')
  const status = searchParams.get('status')

  let query = supabase
    .from('appointments')
    .select(
      `
      *,
      customer:customers(id, full_name, phone),
      vehicle:vehicles(id, license_plate, make, model)
      `
    )
    .eq('garage_id', profile.garageId)
    .order('scheduled_at', { ascending: true })

  if (date) {
    // Filter for a specific day
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)
    query = query
      .gte('scheduled_at', dayStart.toISOString())
      .lte('scheduled_at', dayEnd.toISOString())
  } else if (week) {
    // Filter for a full week (week param is the start of the week, Sunday)
    const weekStart = new Date(week)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    weekEnd.setHours(0, 0, 0, 0)
    query = query
      .gte('scheduled_at', weekStart.toISOString())
      .lt('scheduled_at', weekEnd.toISOString())
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json({ error: 'שגיאה בטעינת תורים' }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [] })
}

export async function POST(request: NextRequest) {
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  const supabase = await createClient()

  let body: {
    customer_id?: string
    vehicle_id?: string
    scheduled_at: string
    duration_minutes?: number
    service_type?: string
    notes?: string
    customer_name?: string
    customer_phone?: string
    status?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  if (!body.scheduled_at) {
    return NextResponse.json({ error: 'חסר שדה חובה: scheduled_at' }, { status: 400 })
  }

  const scheduledAt = new Date(body.scheduled_at)
  if (scheduledAt < new Date()) {
    return NextResponse.json({ error: 'לא ניתן לקבוע תור בעבר' }, { status: 400 })
  }

  const insertPayload = {
    garage_id: profile.garageId,
    customer_id: body.customer_id ?? null,
    vehicle_id: body.vehicle_id ?? null,
    scheduled_at: body.scheduled_at,
    duration_minutes: body.duration_minutes ?? 60,
    service_type: body.service_type ?? null,
    notes: body.notes ?? null,
    status: body.status ?? 'scheduled',
    customer_name: body.customer_name ?? null,
    customer_phone: body.customer_phone ?? null,
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert(insertPayload)
    .select(
      `
      *,
      customer:customers(id, full_name, phone),
      vehicle:vehicles(id, license_plate, make, model)
      `
    )
    .single()

  if (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json({ error: 'שגיאה ביצירת תור' }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
