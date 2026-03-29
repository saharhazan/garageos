'use server'

import { createClient } from '@/lib/supabase/server'
import type { WorkOrder, OrderStatus, OrderItem } from '@/types'

const TAX_RATE = 0.17

interface CreateOrderData {
  customer_id: string
  vehicle_id: string
  technician_id?: string
  priority?: 'normal' | 'high' | 'urgent'
  items: OrderItem[]
  notes?: string
  mileage?: number
}

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

export async function createOrderAction(
  data: CreateOrderData
): Promise<{ order?: WorkOrder; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'לא מורשה' }

  const { data: profile } = await supabase
    .from('users')
    .select('garage_id')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'פרופיל משתמש לא נמצא' }

  const { data: seqData, error: seqError } = await supabase.rpc('next_job_number', {
    p_garage_id: profile.garage_id,
  })
  if (seqError || seqData === null) return { error: 'שגיאה ביצירת מספר עבודה' }

  const { data: garage } = await supabase
    .from('garages')
    .select('settings')
    .eq('id', profile.garage_id)
    .single()

  const settings = (garage?.settings as { job_prefix?: string }) ?? {}
  const prefix = settings.job_prefix ?? 'AK'
  const year = new Date().getFullYear()
  const jobNumber = `${prefix}-${year}-${String(seqData).padStart(4, '0')}`
  const totals = calculateTotals(data.items)

  const { data: order, error } = await supabase
    .from('work_orders')
    .insert({
      garage_id: profile.garage_id,
      job_number: jobNumber,
      customer_id: data.customer_id,
      vehicle_id: data.vehicle_id,
      technician_id: data.technician_id ?? null,
      priority: data.priority ?? 'normal',
      items: data.items as unknown as object[],
      notes: data.notes ?? null,
      mileage: data.mileage ?? null,
      ...totals,
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

  if (error) {
    console.error('createOrderAction error:', error)
    return { error: 'שגיאה ביצירת הזמנה' }
  }

  return { order: order as unknown as WorkOrder }
}

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'לא מורשה' }

  const updates: Record<string, unknown> = { status }
  if (status === 'delivered' || status === 'cancelled') {
    updates.completed_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('work_orders')
    .update(updates)
    .eq('id', orderId)

  if (error) {
    console.error('updateOrderStatusAction error:', error)
    return { success: false, error: 'שגיאה בעדכון סטטוס' }
  }

  return { success: true }
}

export async function assignTechnicianAction(
  orderId: string,
  technicianId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'לא מורשה' }

  // Verify the technician belongs to the same garage
  const { data: profile } = await supabase
    .from('users')
    .select('garage_id')
    .eq('id', user.id)
    .single()

  if (!profile) return { success: false, error: 'פרופיל משתמש לא נמצא' }

  const { data: technician } = await supabase
    .from('users')
    .select('id, role, garage_id')
    .eq('id', technicianId)
    .eq('garage_id', profile.garage_id)
    .single()

  if (!technician) return { success: false, error: 'טכנאי לא נמצא במוסך זה' }

  const { error } = await supabase
    .from('work_orders')
    .update({ technician_id: technicianId })
    .eq('id', orderId)

  if (error) {
    console.error('assignTechnicianAction error:', error)
    return { success: false, error: 'שגיאה בשיוך טכנאי' }
  }

  return { success: true }
}
