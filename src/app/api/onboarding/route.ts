import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'לא מאומת' }, { status: 401 })
    }

    const body = await request.json()
    const { garage_name, address, phone, plan } = body

    if (!garage_name?.trim()) {
      return NextResponse.json({ error: 'שם המוסך הוא שדה חובה' }, { status: 400 })
    }

    const validPlans = ['starter', 'pro', 'enterprise']
    const selectedPlan = validPlans.includes(plan) ? plan : 'starter'

    // Create garage record
    const { data: garage, error: garageError } = await supabase
      .from('garages')
      .insert({
        name: garage_name.trim(),
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        subscription_plan: selectedPlan,
        is_active: true,
        settings: {
          sms_enabled: false,
          whatsapp_enabled: false,
          auto_notify_on_status_change: false,
          tax_rate: 17,
          currency: 'ILS',
          job_prefix: 'WO',
        },
      })
      .select('id')
      .single()

    if (garageError) {
      return NextResponse.json({ error: garageError.message }, { status: 500 })
    }

    // Create user record with super_admin role
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        garage_id: garage.id,
        full_name: user.user_metadata?.full_name || user.email || '',
        email: user.email || null,
        phone: user.user_metadata?.phone || null,
        role: 'super_admin',
        is_active: true,
      })

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    return NextResponse.json({ garage_id: garage.id })
  } catch {
    return NextResponse.json({ error: 'אירעה שגיאה בלתי צפויה' }, { status: 500 })
  }
}
