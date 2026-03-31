import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getApiAuth } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  if (!type || !['orders', 'customers', 'inventory'].includes(type)) {
    return NextResponse.json(
      { error: 'פרמטר type חסר או לא תקין. ערכים: orders, customers, inventory' },
      { status: 400 }
    )
  }

  switch (type) {
    case 'orders': {
      const { data, error } = await supabase
        .from('work_orders')
        .select(
          `
          id, job_number, status, total_amount, created_at,
          customer:customers(full_name, phone),
          vehicle:vehicles(license_plate, make, model)
          `
        )
        .eq('garage_id', profile.garageId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Export orders error:', error)
        return NextResponse.json({ error: 'שגיאה בטעינת עבודות' }, { status: 500 })
      }

      return NextResponse.json({ data: data ?? [] })
    }

    case 'customers': {
      const { data, error } = await supabase
        .from('customers')
        .select('id, full_name, phone, email, notes, created_at')
        .eq('garage_id', profile.garageId)
        .order('full_name', { ascending: true })

      if (error) {
        console.error('Export customers error:', error)
        return NextResponse.json({ error: 'שגיאה בטעינת לקוחות' }, { status: 500 })
      }

      return NextResponse.json({ data: data ?? [] })
    }

    case 'inventory': {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, sku, quantity, min_quantity, unit_price, supplier, category')
        .eq('garage_id', profile.garageId)
        .order('name', { ascending: true })

      if (error) {
        console.error('Export inventory error:', error)
        return NextResponse.json({ error: 'שגיאה בטעינת מלאי' }, { status: 500 })
      }

      return NextResponse.json({ data: data ?? [] })
    }

    default:
      return NextResponse.json({ error: 'סוג לא תקין' }, { status: 400 })
  }
}
