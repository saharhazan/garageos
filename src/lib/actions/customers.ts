'use server'

import { createClient } from '@/lib/supabase/server'
import type { Customer, Vehicle } from '@/types'

interface CreateCustomerWithVehicleData {
  customer: {
    full_name: string
    phone: string
    email?: string
  }
  vehicle: {
    license_plate: string
    make: string
    model: string
    year?: number
    color?: string
  }
}

export async function createCustomerWithVehicleAction(
  data: CreateCustomerWithVehicleData
): Promise<{ customerId?: string; vehicleId?: string; error?: string }> {
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

  // Create customer
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .insert({
      garage_id: profile.garage_id,
      full_name: data.customer.full_name,
      phone: data.customer.phone,
      email: data.customer.email ?? null,
    })
    .select('id')
    .single()

  if (customerError) {
    console.error('createCustomerWithVehicleAction (customer) error:', customerError)
    return { error: 'שגיאה ביצירת לקוח' }
  }

  // Create vehicle linked to new customer
  const { data: vehicle, error: vehicleError } = await supabase
    .from('vehicles')
    .insert({
      garage_id: profile.garage_id,
      customer_id: customer.id,
      license_plate: data.vehicle.license_plate,
      make: data.vehicle.make,
      model: data.vehicle.model,
      year: data.vehicle.year ?? null,
      color: data.vehicle.color ?? null,
    })
    .select('id')
    .single()

  if (vehicleError) {
    console.error('createCustomerWithVehicleAction (vehicle) error:', vehicleError)
    // Customer was created — return partial success
    return {
      customerId: customer.id,
      error:
        vehicleError.code === '23505'
          ? 'לוחית רישוי כבר קיימת במוסך זה'
          : 'שגיאה ביצירת רכב',
    }
  }

  return { customerId: customer.id, vehicleId: vehicle.id }
}

export async function lookupByPlateAction(
  plate: string
): Promise<{ customer?: Customer; vehicle?: Vehicle; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'לא מורשה' }

  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select(
      `
      *,
      customer:customers(*)
      `
    )
    .ilike('license_plate', plate.trim())
    .limit(1)

  if (error) {
    console.error('lookupByPlateAction error:', error)
    return { error: 'שגיאה בחיפוש לוחית רישוי' }
  }

  if (!vehicles || vehicles.length === 0) {
    return {}
  }

  const vehicle = vehicles[0] as Vehicle & { customer: Customer }
  return {
    vehicle: { ...vehicle, customer: undefined } as Vehicle,
    customer: vehicle.customer,
  }
}
