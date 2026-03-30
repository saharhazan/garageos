import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'לא מורשה' }, { status: 401 })
  }

  let body: { password: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  if (!body.password || body.password.length < 6) {
    return NextResponse.json({ error: 'הסיסמה חייבת להכיל לפחות 6 תווים' }, { status: 400 })
  }

  const { error } = await supabase.auth.updateUser({ password: body.password })

  if (error) {
    console.error('Error changing password:', error)
    return NextResponse.json({ error: 'שגיאה בשינוי הסיסמה' }, { status: 500 })
  }

  return NextResponse.json({ message: 'הסיסמה עודכנה בהצלחה' })
}
