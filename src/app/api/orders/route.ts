import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getApiAuth } from '@/lib/api-auth'
import { checkOrderLimit } from '@/lib/plan-limits'
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
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10))
  const offset = (page - 1) * limit

  let query = supabase
    .from('work_orders')
    .select(
      `
      *,
      customer:customers(id, full_name, phone, email),
      vehicle:vehicles(id, license_plate, make, model, year, color),
      technician:users!work_orders_technician_id_fkey(id, full_name, role)
      `,
      { count: 'exact' }
    )
    .eq('garage_id', profile.garageId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }

  if (search) {
    // Search by job_number or customer name or license plate
    query = query.or(
      `job_number.ilike.%${search}%,customers.full_name.ilike.%${search}%,vehicles.license_plate.ilike.%${search}%`
    )
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'שגיאה בטעינת הזמנות' }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [], total: count ?? 0 })
}

export async function POST(request: NextRequest) {
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  const supabase = await createClient()

  let body: {
    customer_id: string
    vehicle_id: string
    technician_id?: string
    priority?: 'normal' | 'high' | 'urgent'
    items?: OrderItem[]
    notes?: string
    mileage?: number
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  if (!body.customer_id || !body.vehicle_id) {
    return NextResponse.json({ error: 'חסרים שדות חובה: customer_id, vehicle_id' }, { status: 400 })
  }

  // Fetch garage for plan check and settings
  const { data: garage } = await supabase
    .from('garages')
    .select('subscription_plan, settings')
    .eq('id', profile.garageId)
    .single()

  const plan = garage?.subscription_plan ?? 'starter'
  const orderLimit = await checkOrderLimit(supabase, profile.garageId, plan)
  if (!orderLimit.allowed) {
    return NextResponse.json(
      {
        error: 'הגעת למגבלת כרטיסי העבודה בתוכנית שלך. שדרג לתוכנית מקצועי.',
        upgrade: true,
      },
      { status: 403 }
    )
  }

  // Generate job number using DB function
  const { data: seqData, error: seqError } = await supabase.rpc('next_job_number', {
    p_garage_id: profile.garageId,
  })
  if (seqError || seqData === null) {
    console.error('Error generating job number:', seqError)
    return NextResponse.json({ error: 'שגיאה ביצירת מספר עבודה' }, { status: 500 })
  }

  const settings = (garage?.settings as { job_prefix?: string }) ?? {}
  const prefix = settings.job_prefix ?? 'AK'
  const year = new Date().getFullYear()
  const jobNumber = `${prefix}-${year}-${String(seqData).padStart(4, '0')}`

  const items: OrderItem[] = body.items ?? []
  const totals = calculateTotals(items)

  const insertPayload = {
    garage_id: profile.garageId,
    job_number: jobNumber,
    customer_id: body.customer_id,
    vehicle_id: body.vehicle_id,
    technician_id: body.technician_id ?? null,
    priority: body.priority ?? 'normal',
    items: items as unknown as object[],
    notes: body.notes ?? null,
    mileage: body.mileage ?? null,
    ...totals,
  }

  const { data, error } = await supabase
    .from('work_orders')
    .insert(insertPayload)
    .select(
      `
      *,
      customer:customers(id, full_name, phone, email),
      vehicle:vehicles(id, license_plate, make, model, year, color),
      technician:users!work_orders_technician_id_fkey(id, full_name, role)
      `
    )
    .single()

  if (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'שגיאה ביצירת הזמנה' }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
