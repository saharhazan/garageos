import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { OrderItem } from '@/types'

const TAX_RATE = 0.17

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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'לא מורשה' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('quotes')
    .select(
      `
      *,
      customer:customers(id, full_name, phone, email),
      vehicle:vehicles(id, license_plate, make, model, year, color)
      `
    )
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching quote:', error)
    return NextResponse.json({ error: 'הצעת מחיר לא נמצאה' }, { status: 404 })
  }

  return NextResponse.json({ data })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'לא מורשה' }, { status: 401 })
  }

  let body: {
    items?: OrderItem[]
    notes?: string
    status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
    valid_until?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}

  if (body.items !== undefined) {
    updates.items = body.items as unknown as object[]
    const totals = calculateTotals(body.items)
    updates.subtotal = totals.subtotal
    updates.tax_amount = totals.tax_amount
    updates.total_amount = totals.total_amount
  }

  if (body.notes !== undefined) updates.notes = body.notes
  if (body.status !== undefined) updates.status = body.status
  if (body.valid_until !== undefined) updates.valid_until = body.valid_until

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'לא נשלחו שדות לעדכון' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('quotes')
    .update(updates)
    .eq('id', id)
    .select(
      `
      *,
      customer:customers(id, full_name, phone, email),
      vehicle:vehicles(id, license_plate, make, model, year, color)
      `
    )
    .single()

  if (error) {
    console.error('Error updating quote:', error)
    return NextResponse.json({ error: 'שגיאה בעדכון הצעת מחיר' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'לא מורשה' }, { status: 401 })
  }

  let body: { action: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  if (body.action !== 'convert') {
    return NextResponse.json({ error: 'פעולה לא נתמכת' }, { status: 400 })
  }

  // Fetch the quote
  const { data: quote, error: fetchError } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !quote) {
    return NextResponse.json({ error: 'הצעת מחיר לא נמצאה' }, { status: 404 })
  }

  // Generate job number for the new work order
  const { data: seqData, error: seqError } = await supabase.rpc('next_job_number', {
    p_garage_id: quote.garage_id,
  })
  if (seqError || seqData === null) {
    console.error('Error generating job number:', seqError)
    return NextResponse.json({ error: 'שגיאה ביצירת מספר עבודה' }, { status: 500 })
  }

  const { data: garage } = await supabase
    .from('garages')
    .select('settings')
    .eq('id', quote.garage_id)
    .single()

  const settings = (garage?.settings as { job_prefix?: string }) ?? {}
  const prefix = settings.job_prefix ?? 'AK'
  const year = new Date().getFullYear()
  const jobNumber = `${prefix}-${year}-${String(seqData).padStart(4, '0')}`

  // Create work order from quote
  const { data: order, error: orderError } = await supabase
    .from('work_orders')
    .insert({
      garage_id: quote.garage_id,
      job_number: jobNumber,
      customer_id: quote.customer_id,
      vehicle_id: quote.vehicle_id,
      items: quote.items,
      notes: quote.notes,
      subtotal: quote.subtotal,
      tax_amount: quote.tax_amount,
      total_amount: quote.total_amount,
    })
    .select(
      `
      *,
      customer:customers(id, full_name, phone, email),
      vehicle:vehicles(id, license_plate, make, model, year, color),
      technician:users!work_orders_technician_id_fkey(id, full_name, role)
      `
    )
    .single()

  if (orderError) {
    console.error('Error converting quote to order:', orderError)
    return NextResponse.json({ error: 'שגיאה בהמרת הצעה להזמנה' }, { status: 500 })
  }

  // Mark quote as accepted
  await supabase.from('quotes').update({ status: 'accepted' }).eq('id', id)

  return NextResponse.json({ data: order }, { status: 201 })
}
