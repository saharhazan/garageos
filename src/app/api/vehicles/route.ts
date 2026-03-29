import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
  const plate = searchParams.get('plate')
  const customerId = searchParams.get('customer_id')

  let query = supabase
    .from('vehicles')
    .select('*, customer:customers(id, full_name, phone, email)')
    .order('created_at', { ascending: false })

  if (plate) {
    // Normalize plate: remove spaces and dashes for comparison, then exact match
    query = query.ilike('license_plate', plate.trim())
  }

  if (customerId) {
    query = query.eq('customer_id', customerId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json({ error: 'שגיאה בטעינת כלי רכב' }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [] })
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
    license_plate: string
    make: string
    model: string
    year?: number | null
    color?: string | null
    vin?: string | null
    notes?: string | null
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  if (!body.customer_id || !body.license_plate || !body.make || !body.model) {
    return NextResponse.json(
      { error: 'חסרים שדות חובה: customer_id, license_plate, make, model' },
      { status: 400 }
    )
  }

  const { data: profile } = await supabase
    .from('users')
    .select('garage_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'פרופיל משתמש לא נמצא' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('vehicles')
    .insert({
      garage_id: profile.garage_id,
      customer_id: body.customer_id,
      license_plate: body.license_plate,
      make: body.make,
      model: body.model,
      year: body.year ?? null,
      color: body.color ?? null,
      vin: body.vin ?? null,
      notes: body.notes ?? null,
    })
    .select('*, customer:customers(id, full_name, phone, email)')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'לוחית רישוי כבר קיימת במוסך זה' }, { status: 409 })
    }
    console.error('Error creating vehicle:', error)
    return NextResponse.json({ error: 'שגיאה ביצירת רכב' }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
