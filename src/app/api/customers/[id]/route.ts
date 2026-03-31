import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getApiAuth } from '@/lib/api-auth'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  const supabase = await createClient()

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('garage_id', profile.garageId)
    .single()

  if (customerError) {
    if (customerError.code === 'PGRST116') {
      return NextResponse.json({ error: 'לקוח לא נמצא' }, { status: 404 })
    }
    console.error('Error fetching customer:', customerError)
    return NextResponse.json({ error: 'שגיאה בטעינת לקוח' }, { status: 500 })
  }

  const { data: vehicles, error: vehiclesError } = await supabase
    .from('vehicles')
    .select('*')
    .eq('customer_id', id)
    .eq('garage_id', profile.garageId)
    .order('created_at', { ascending: false })

  if (vehiclesError) {
    console.error('Error fetching vehicles:', vehiclesError)
    return NextResponse.json({ error: 'שגיאה בטעינת כלי רכב' }, { status: 500 })
  }

  return NextResponse.json({ data: { ...customer, vehicles: vehicles ?? [] } })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  const supabase = await createClient()

  let body: Partial<{
    full_name: string
    phone: string
    email: string | null
    notes: string | null
  }>

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (body.full_name !== undefined) updates.full_name = body.full_name
  if (body.phone !== undefined) updates.phone = body.phone
  if ('email' in body) updates.email = body.email
  if ('notes' in body) updates.notes = body.notes

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'אין שדות לעדכון' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .eq('garage_id', profile.garageId)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'לקוח לא נמצא' }, { status: 404 })
    }
    console.error('Error updating customer:', error)
    return NextResponse.json({ error: 'שגיאה בעדכון לקוח' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  const supabase = await createClient()

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)
    .eq('garage_id', profile.garageId)

  if (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json({ error: 'שגיאה במחיקת לקוח' }, { status: 500 })
  }

  return NextResponse.json({ data: { success: true } })
}
