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
    .from('inventory')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'פריט מלאי לא נמצא' }, { status: 404 })
    }
    console.error('Error fetching inventory item:', error)
    return NextResponse.json({ error: 'שגיאה בטעינת פריט מלאי' }, { status: 500 })
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
    name: string
    sku: string | null
    quantity: number
    min_quantity: number
    unit_price: number
    supplier: string | null
    category: string | null
  }>

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (body.name !== undefined) updates.name = body.name
  if ('sku' in body) updates.sku = body.sku
  if (body.quantity !== undefined) updates.quantity = body.quantity
  if (body.min_quantity !== undefined) updates.min_quantity = body.min_quantity
  if (body.unit_price !== undefined) updates.unit_price = body.unit_price
  if ('supplier' in body) updates.supplier = body.supplier
  if ('category' in body) updates.category = body.category

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'אין שדות לעדכון' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('inventory')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'פריט מלאי לא נמצא' }, { status: 404 })
    }
    console.error('Error updating inventory item:', error)
    return NextResponse.json({ error: 'שגיאה בעדכון פריט מלאי' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'לא מורשה' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['super_admin', 'manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'אין הרשאה למחוק פריטי מלאי' }, { status: 403 })
  }

  const { error } = await supabase.from('inventory').delete().eq('id', id)

  if (error) {
    console.error('Error deleting inventory item:', error)
    return NextResponse.json({ error: 'שגיאה במחיקת פריט מלאי' }, { status: 500 })
  }

  return NextResponse.json({ data: { success: true } })
}
