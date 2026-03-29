import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'לא מורשה' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('vehicles')
    .select('*, customer:customers(id, full_name, phone, email)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'רכב לא נמצא' }, { status: 404 })
    }
    console.error('Error fetching vehicle:', error)
    return NextResponse.json({ error: 'שגיאה בטעינת רכב' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'לא מורשה' }, { status: 401 })
  }

  let body: Partial<{
    customer_id: string
    license_plate: string
    make: string
    model: string
    year: number | null
    color: string | null
    vin: string | null
    notes: string | null
  }>

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (body.customer_id !== undefined) updates.customer_id = body.customer_id
  if (body.license_plate !== undefined) updates.license_plate = body.license_plate
  if (body.make !== undefined) updates.make = body.make
  if (body.model !== undefined) updates.model = body.model
  if ('year' in body) updates.year = body.year
  if ('color' in body) updates.color = body.color
  if ('vin' in body) updates.vin = body.vin
  if ('notes' in body) updates.notes = body.notes

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'אין שדות לעדכון' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('vehicles')
    .update(updates)
    .eq('id', id)
    .select('*, customer:customers(id, full_name, phone, email)')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'רכב לא נמצא' }, { status: 404 })
    }
    if (error.code === '23505') {
      return NextResponse.json({ error: 'לוחית רישוי כבר קיימת במוסך זה' }, { status: 409 })
    }
    console.error('Error updating vehicle:', error)
    return NextResponse.json({ error: 'שגיאה בעדכון רכב' }, { status: 500 })
  }

  return NextResponse.json({ data })
}
