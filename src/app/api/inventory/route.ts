import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getApiAuth } from '@/lib/api-auth'

export async function GET(_request: NextRequest) {
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('garage_id', profile.garageId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json({ error: 'שגיאה בטעינת מלאי' }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [] })
}

export async function POST(request: NextRequest) {
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  const supabase = await createClient()

  let body: {
    name: string
    sku?: string | null
    quantity?: number
    min_quantity?: number
    unit_price?: number
    supplier?: string | null
    category?: string | null
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  if (!body.name) {
    return NextResponse.json({ error: 'חסר שם פריט' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('inventory')
    .insert({
      garage_id: profile.garageId,
      name: body.name,
      sku: body.sku ?? null,
      quantity: body.quantity ?? 0,
      min_quantity: body.min_quantity ?? 5,
      unit_price: body.unit_price ?? 0,
      supplier: body.supplier ?? null,
      category: body.category ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating inventory item:', error)
    return NextResponse.json({ error: 'שגיאה ביצירת פריט מלאי' }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
