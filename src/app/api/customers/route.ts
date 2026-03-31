import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getApiAuth } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')

  let query = supabase
    .from('customers')
    .select('*')
    .eq('garage_id', profile.garageId)
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
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  const supabase = await createClient()

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

  const { data, error } = await supabase
    .from('customers')
    .insert({
      garage_id: profile.garageId,
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
