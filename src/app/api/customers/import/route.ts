import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getApiAuth } from '@/lib/api-auth'

interface ImportCustomerRecord {
  full_name: string
  phone: string
  email?: string | null
  notes?: string | null
  license_plate?: string | null
  make?: string | null
  model?: string | null
  year?: number | null
  color?: string | null
}

export async function POST(request: NextRequest) {
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  // Only manager+ can import
  if (!['super_admin', 'manager', 'receptionist'].includes(profile.role)) {
    return NextResponse.json({ error: 'אין הרשאה לייבא לקוחות' }, { status: 403 })
  }

  const supabase = await createClient()

  let body: { records: ImportCustomerRecord[] }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  if (!Array.isArray(body.records) || body.records.length === 0) {
    return NextResponse.json({ error: 'לא נמצאו רשומות לייבוא' }, { status: 400 })
  }

  if (body.records.length > 1000) {
    return NextResponse.json({ error: 'מקסימום 1000 רשומות בייבוא אחד' }, { status: 400 })
  }

  let imported = 0
  const errors: string[] = []

  for (let i = 0; i < body.records.length; i++) {
    const record = body.records[i]
    const rowNum = i + 1

    // Validate required fields
    if (!record.full_name || !record.phone) {
      errors.push(`שורה ${rowNum}: חסר שם מלא או טלפון`)
      continue
    }

    // Normalize phone - remove spaces, dashes
    const phone = record.phone.toString().replace(/[-\s()]/g, '').trim()

    try {
      // Upsert customer by phone + garage_id
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .upsert(
          {
            garage_id: profile.garageId,
            full_name: record.full_name.trim(),
            phone,
            email: record.email?.trim() || null,
            notes: record.notes?.trim() || null,
          },
          {
            onConflict: 'garage_id,phone',
          }
        )
        .select('id')
        .single()

      if (customerError) {
        // If upsert fails due to missing unique constraint, try insert-or-select
        const { data: existing } = await supabase
          .from('customers')
          .select('id')
          .eq('garage_id', profile.garageId)
          .eq('phone', phone)
          .single()

        if (existing) {
          // Update existing customer
          await supabase
            .from('customers')
            .update({
              full_name: record.full_name.trim(),
              email: record.email?.trim() || null,
              notes: record.notes?.trim() || null,
            })
            .eq('id', existing.id)

          // Create vehicle if data provided
          if (record.license_plate && record.make && record.model) {
            await upsertVehicle(supabase, {
              garageId: profile.garageId,
              customerId: existing.id,
              licensePlate: record.license_plate.trim(),
              make: record.make.trim(),
              model: record.model.trim(),
              year: record.year ?? null,
              color: record.color?.trim() ?? null,
            })
          }

          imported++
          continue
        }

        errors.push(`שורה ${rowNum}: ${customerError.message}`)
        continue
      }

      // Create vehicle if data provided
      if (customer && record.license_plate && record.make && record.model) {
        await upsertVehicle(supabase, {
          garageId: profile.garageId,
          customerId: customer.id,
          licensePlate: record.license_plate.trim(),
          make: record.make.trim(),
          model: record.model.trim(),
          year: record.year ?? null,
          color: record.color?.trim() ?? null,
        })
      }

      imported++
    } catch (err) {
      errors.push(`שורה ${rowNum}: שגיאה לא צפויה`)
      console.error(`Import row ${rowNum} error:`, err)
    }
  }

  return NextResponse.json({ imported, errors, total: body.records.length })
}

async function upsertVehicle(
  supabase: Awaited<ReturnType<typeof createClient>>,
  data: {
    garageId: string
    customerId: string
    licensePlate: string
    make: string
    model: string
    year: number | null
    color: string | null
  }
) {
  // Check if vehicle exists
  const { data: existing } = await supabase
    .from('vehicles')
    .select('id')
    .eq('garage_id', data.garageId)
    .eq('license_plate', data.licensePlate)
    .single()

  if (existing) {
    // Update existing vehicle
    await supabase
      .from('vehicles')
      .update({
        customer_id: data.customerId,
        make: data.make,
        model: data.model,
        year: data.year,
        color: data.color,
      })
      .eq('id', existing.id)
  } else {
    // Insert new vehicle
    await supabase.from('vehicles').insert({
      garage_id: data.garageId,
      customer_id: data.customerId,
      license_plate: data.licensePlate,
      make: data.make,
      model: data.model,
      year: data.year,
      color: data.color,
    })
  }
}
