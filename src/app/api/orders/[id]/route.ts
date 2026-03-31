import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getApiAuth } from '@/lib/api-auth'
import type { OrderItem, OrderStatus } from '@/types'

const TAX_RATE = 0.18

function calculateTotals(items: OrderItem[]): {
  subtotal: number
  tax_amount: number
  total_amount: number
} {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const tax_amount = parseFloat((subtotal * TAX_RATE).toFixed(2))
  const total_amount = parseFloat((subtotal + tax_amount).toFixed(2))
  return { subtotal: parseFloat(subtotal.toFixed(2)), tax_amount, total_amount }
}

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('work_orders')
    .select(
      `
      *,
      customer:customers(id, full_name, phone, email, notes),
      vehicle:vehicles(id, license_plate, make, model, year, color, vin, notes),
      technician:users!work_orders_technician_id_fkey(id, full_name, role, phone)
      `
    )
    .eq('id', id)
    .eq('garage_id', profile.garageId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'הזמנה לא נמצאה' }, { status: 404 })
    }
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'שגיאה בטעינת הזמנה' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  const supabase = await createClient()

  let body: Partial<{
    status: OrderStatus
    priority: 'normal' | 'high' | 'urgent'
    technician_id: string | null
    items: OrderItem[]
    notes: string | null
    mileage: number | null
    signature_url: string | null
    images: string[]
  }>

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  // Build update object
  const updates: Record<string, unknown> = {}

  if (body.status !== undefined) {
    updates.status = body.status
    if (body.status === 'delivered' || body.status === 'cancelled') {
      updates.completed_at = new Date().toISOString()
    }
  }
  if (body.priority !== undefined) updates.priority = body.priority
  if ('technician_id' in body) updates.technician_id = body.technician_id
  if ('notes' in body) updates.notes = body.notes
  if ('mileage' in body) updates.mileage = body.mileage
  if ('signature_url' in body) updates.signature_url = body.signature_url
  if (body.images !== undefined) updates.images = body.images

  // Recalculate totals if items changed
  if (body.items !== undefined) {
    updates.items = body.items as unknown as object[]
    const totals = calculateTotals(body.items)
    updates.subtotal = totals.subtotal
    updates.tax_amount = totals.tax_amount
    updates.total_amount = totals.total_amount
  }

  const { data, error } = await supabase
    .from('work_orders')
    .update(updates)
    .eq('id', id)
    .eq('garage_id', profile.garageId)
    .select(
      `
      *,
      customer:customers(id, full_name, phone, email, notes),
      vehicle:vehicles(id, license_plate, make, model, year, color, vin, notes),
      technician:users!work_orders_technician_id_fkey(id, full_name, role, phone)
      `
    )
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'הזמנה לא נמצאה' }, { status: 404 })
    }
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'שגיאה בעדכון הזמנה' }, { status: 500 })
  }

  // Trigger notification on status change
  if (body.status !== undefined) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, status: body.status }),
      })
    } catch (notifyErr) {
      console.error('Notification error (non-fatal):', notifyErr)
    }
  }

  return NextResponse.json({ data })
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  // Only manager+ can delete
  if (!['super_admin', 'manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'אין הרשאה למחוק הזמנות' }, { status: 403 })
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('work_orders')
    .delete()
    .eq('id', id)
    .eq('garage_id', profile.garageId)

  if (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json({ error: 'שגיאה במחיקת הזמנה' }, { status: 500 })
  }

  return NextResponse.json({ data: { success: true } })
}
