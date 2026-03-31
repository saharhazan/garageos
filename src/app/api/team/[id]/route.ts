import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getApiAuth } from '@/lib/api-auth'

function getServiceClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ─── PATCH: Update team member role or active status ─────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  // Only super_admin and manager can update
  if (!['super_admin', 'manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'אין הרשאה לעדכן משתמשים' }, { status: 403 })
  }

  const { id: targetUserId } = await params

  let body: { role?: string; is_active?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  // Can't change own role
  if (body.role !== undefined && targetUserId === profile.userId) {
    return NextResponse.json({ error: 'לא ניתן לשנות את התפקיד של עצמך' }, { status: 400 })
  }

  const adminClient = getServiceClient()

  // Validate role if provided
  if (body.role !== undefined) {
    const validRoles = ['super_admin', 'manager', 'receptionist', 'technician', 'viewer']
    if (!validRoles.includes(body.role)) {
      return NextResponse.json({ error: 'תפקיד לא חוקי' }, { status: 400 })
    }

    // Only super_admin can set someone as super_admin
    if (body.role === 'super_admin' && profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'רק מנהל ראשי יכול למנות מנהלים ראשיים' }, { status: 403 })
    }
  }

  // Get target user to check current state
  const { data: targetUser, error: fetchError } = await adminClient
    .from('users')
    .select('*')
    .eq('id', targetUserId)
    .eq('garage_id', profile.garageId)
    .single()

  if (fetchError || !targetUser) {
    return NextResponse.json({ error: 'המשתמש לא נמצא' }, { status: 404 })
  }

  // Check: can't demote the last super_admin
  if (targetUser.role === 'super_admin' && body.role && body.role !== 'super_admin') {
    const { count } = await adminClient
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('garage_id', profile.garageId)
      .eq('role', 'super_admin')
      .eq('is_active', true)

    if ((count ?? 0) <= 1) {
      return NextResponse.json({ error: 'לא ניתן להסיר את המנהל הראשי האחרון' }, { status: 400 })
    }
  }

  // Check: can't deactivate the last super_admin
  if (targetUser.role === 'super_admin' && body.is_active === false) {
    const { count } = await adminClient
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('garage_id', profile.garageId)
      .eq('role', 'super_admin')
      .eq('is_active', true)

    if ((count ?? 0) <= 1) {
      return NextResponse.json({ error: 'לא ניתן לבטל את המנהל הראשי האחרון' }, { status: 400 })
    }
  }

  // Build updates
  const updates: Record<string, unknown> = {}
  if (body.role !== undefined) updates.role = body.role
  if (body.is_active !== undefined) updates.is_active = body.is_active

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'לא נשלחו שדות לעדכון' }, { status: 400 })
  }

  const { data, error } = await adminClient
    .from('users')
    .update(updates)
    .eq('id', targetUserId)
    .eq('garage_id', profile.garageId)
    .select()
    .single()

  if (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json({ error: 'שגיאה בעדכון המשתמש' }, { status: 500 })
  }

  return NextResponse.json({ data })
}
