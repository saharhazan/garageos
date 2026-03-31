import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { getApiAuth } from '@/lib/api-auth'

function getServiceClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ─── GET: List all team members in the garage ────────────
export async function GET() {
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  const supabase = await createClient()

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('garage_id', profile.garageId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json({ error: 'שגיאה בטעינת הצוות' }, { status: 500 })
  }

  // Fetch emails from auth.users via service role client
  const adminClient = getServiceClient()
  const userIds = (users ?? []).map((u) => u.id)

  const emailMap: Record<string, string> = {}
  if (userIds.length > 0) {
    // Use admin API to list users and map emails
    const { data: authData } = await adminClient.auth.admin.listUsers({
      perPage: 1000,
    })
    if (authData?.users) {
      for (const au of authData.users) {
        if (userIds.includes(au.id)) {
          emailMap[au.id] = au.email ?? ''
        }
      }
    }
  }

  const enrichedUsers = (users ?? []).map((u) => ({
    ...u,
    email: emailMap[u.id] ?? null,
  }))

  return NextResponse.json({ data: enrichedUsers })
}

// ─── POST: Invite a new team member ─────────────────────
export async function POST(request: NextRequest) {
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  // Only super_admin and manager can invite
  if (!['super_admin', 'manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'אין הרשאה להזמין משתמשים' }, { status: 403 })
  }

  let body: { email: string; role: string; full_name: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  const { email, role, full_name } = body

  if (!email || !role || !full_name) {
    return NextResponse.json({ error: 'חסרים שדות חובה: email, role, full_name' }, { status: 400 })
  }

  const validRoles = ['super_admin', 'manager', 'receptionist', 'technician', 'viewer']
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: 'תפקיד לא חוקי' }, { status: 400 })
  }

  // Only super_admin can create other super_admins
  if (role === 'super_admin' && profile.role !== 'super_admin') {
    return NextResponse.json({ error: 'רק מנהל ראשי יכול ליצור מנהלים ראשיים' }, { status: 403 })
  }

  const adminClient = getServiceClient()

  // Generate a temporary password
  const tempPassword = generateTempPassword()

  // Create auth user
  const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  })

  if (authError) {
    console.error('Error creating auth user:', authError)
    if (authError.message?.includes('already been registered')) {
      return NextResponse.json({ error: 'כתובת האימייל כבר רשומה במערכת' }, { status: 409 })
    }
    return NextResponse.json({ error: 'שגיאה ביצירת המשתמש' }, { status: 500 })
  }

  if (!authUser.user) {
    return NextResponse.json({ error: 'שגיאה ביצירת המשתמש' }, { status: 500 })
  }

  // Create users record (use service client to bypass RLS for insert)
  const { data: userRecord, error: userError } = await adminClient
    .from('users')
    .insert({
      id: authUser.user.id,
      garage_id: profile.garageId,
      full_name,
      role,
      is_active: true,
    })
    .select()
    .single()

  if (userError) {
    console.error('Error creating user record:', userError)
    // Cleanup: delete the auth user we just created
    await adminClient.auth.admin.deleteUser(authUser.user.id)
    return NextResponse.json({ error: 'שגיאה ביצירת רשומת המשתמש' }, { status: 500 })
  }

  return NextResponse.json({
    data: { ...userRecord, email },
    temp_password: tempPassword,
  })
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password + '!'
}
