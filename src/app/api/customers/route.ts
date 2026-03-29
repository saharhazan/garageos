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
  const search = searchParams.get('search')

  let query = supabase
    .from('customers')
    .select('*')
    .order('full_name', { ascending: true })

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'שגיאה בטעינת לקוחות' }, { status: 500 })
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
    full_name: string
    phone: string
    email?: string | null
    notes?: string | null
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  if (!body.full_name || !body.phone) {
    return NextResponse.json({ error: 'חסרים שדות חובה: full_name, phone' }, { status: 400 })
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
    .from('customers')
    .insert({
      garage_id: profile.garage_id,
      full_name: body.full_name,
      phone: body.phone,
      email: body.email ?? null,
      notes: body.notes ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json({ error: 'שגיאה ביצירת לקוח' }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
