import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { DashboardStats } from '@/types'

export async function GET() {
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
    .select('garage_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'פרופיל משתמש לא נמצא' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('dashboard_stats')
    .select('*')
    .eq('garage_id', profile.garage_id)
    .single()

  if (error) {
    console.error('Error fetching dashboard stats:', error)
    // Return zeroed stats rather than an error to avoid breaking the UI
    const empty: DashboardStats = {
      open_orders: 0,
      in_progress: 0,
      ready_for_pickup: 0,
      completed_today: 0,
      revenue_today: 0,
      revenue_week: 0,
      revenue_month: 0,
      appointments_today: 0,
    }
    return NextResponse.json({ data: empty })
  }

  // The DB view does not have appointments_today — add default
  const stats: DashboardStats = {
    open_orders: Number(data.open_orders ?? 0),
    in_progress: Number(data.in_progress ?? 0),
    ready_for_pickup: Number(data.ready_for_pickup ?? 0),
    completed_today: Number(data.completed_today ?? 0),
    revenue_today: Number(data.revenue_today ?? 0),
    revenue_week: Number(data.revenue_week ?? 0),
    revenue_month: Number(data.revenue_month ?? 0),
    appointments_today: 0,
  }

  return NextResponse.json({ data: stats })
}
