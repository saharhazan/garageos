import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'לא מורשה' }, { status: 401 })
  }

  // Verify user is super_admin or manager
  const { data: profile } = await supabase
    .from('users')
    .select('garage_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'פרופיל משתמש לא נמצא' }, { status: 400 })
  }

  if (!['super_admin', 'manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'אין הרשאה לעדכון הגדרות מוסך' }, { status: 403 })
  }

  let body: {
    name?: string
    address?: string
    phone?: string
    settings?: {
      tax_rate?: number
      currency?: string
      job_prefix?: string
      sms_enabled?: boolean
      whatsapp_enabled?: boolean
      auto_notify_on_status_change?: boolean
    }
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  // Build top-level updates
  const updates: Record<string, unknown> = {}
  if (body.name !== undefined) updates.name = body.name
  if (body.address !== undefined) updates.address = body.address
  if (body.phone !== undefined) updates.phone = body.phone

  // Merge settings if provided
  if (body.settings) {
    const { data: currentGarage } = await supabase
      .from('garages')
      .select('settings')
      .eq('id', profile.garage_id)
      .single()

    const currentSettings = (currentGarage?.settings as Record<string, unknown>) ?? {}
    updates.settings = { ...currentSettings, ...body.settings }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'לא נשלחו שדות לעדכון' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('garages')
    .update(updates)
    .eq('id', profile.garage_id)
    .select()
    .single()

  if (error) {
    console.error('Error updating garage:', error)
    return NextResponse.json({ error: 'שגיאה בעדכון פרטי מוסך' }, { status: 500 })
  }

  return NextResponse.json({ data })
}
