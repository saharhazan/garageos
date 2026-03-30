import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { OrderItem } from '@/types'

const TAX_RATE = 0.17
const DEFAULT_LIMIT = 20

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

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'לא מורשה' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10))
  const offset = (page - 1) * limit

  let query = supabase
    .from('quotes')
    .select(
      `
      *,
      customer:customers(id, full_name, phone, email),
      vehicle:vehicles(id, license_plate, make, model, year, color)
      `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }

  if (search) {
    query = query.or(
      `quote_number.ilike.%${search}%,customers.full_name.ilike.%${search}%,vehicles.license_plate.ilike.%${search}%`
    )
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json({ error: 'שגיאה בטעינת הצעות מחיר' }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [], total: count ?? 0 })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'לא מורשה' }, { status: 401 })
  }

  let body: {
    customer_id: string
    vehicle_id: string
    items?: OrderItem[]
    notes?: string
    valid_until?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  if (!body.customer_id || !body.vehicle_id) {
    return NextResponse.json({ error: 'חסרים שדות חובה: customer_id, vehicle_id' }, { status: 400 })
  }

  // Get garage_id from user profile
  const { data: profile } = await supabase
    .from('users')
    .select('garage_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'פרופיל משתמש לא נמצא' }, { status: 400 })
  }

  // Generate quote number using DB function
  const { data: seqData, error: seqError } = await supabase.rpc('next_quote_number', {
    p_garage_id: profile.garage_id,
  })
  if (seqError || seqData === null) {
    console.error('Error generating quote number:', seqError)
    return NextResponse.json({ error: 'שגיאה ביצירת מספר הצעה' }, { status: 500 })
  }

  // Fetch garage settings for prefix
  const { data: garage } = await supabase
    .from('garages')
    .select('settings')
    .eq('id', profile.garage_id)
    .single()

  const settings = (garage?.settings as { job_prefix?: string }) ?? {}
  const prefix = settings.job_prefix ?? 'AK'
  const year = new Date().getFullYear()
  const quoteNumber = `Q-${prefix}-${year}-${String(seqData).padStart(4, '0')}`

  const items: OrderItem[] = body.items ?? []
  const totals = calculateTotals(items)

  const insertPayload = {
    garage_id: profile.garage_id,
    quote_number: quoteNumber,
    customer_id: body.customer_id,
    vehicle_id: body.vehicle_id,
    items: items as unknown as object[],
    notes: body.notes ?? null,
    valid_until: body.valid_until ?? null,
    ...totals,
  }

  const { data, error } = await supabase
    .from('quotes')
    .insert(insertPayload)
    .select(
      `
      *,
      customer:customers(id, full_name, phone, email),
      vehicle:vehicles(id, license_plate, make, model, year, color)
      `
    )
    .single()

  if (error) {
    console.error('Error creating quote:', error)
    return NextResponse.json({ error: 'שגיאה ביצירת הצעת מחיר' }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
