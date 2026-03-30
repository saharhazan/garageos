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

  let body: { full_name?: string; phone?: string; avatar_url?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  const updates: Record<string, string> = {}
  if (body.full_name !== undefined) updates.full_name = body.full_name
  if (body.phone !== undefined) updates.phone = body.phone
  if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'לא נשלחו שדות לעדכון' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'שגיאה בעדכון הפרופיל' }, { status: 500 })
  }

  return NextResponse.json({ data })
}
