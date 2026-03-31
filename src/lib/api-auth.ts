import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export interface ApiProfile {
  userId: string
  garageId: string
  role: string
}

/**
 * Get authenticated user's profile for API routes.
 * Returns the profile or a 401 NextResponse.
 */
export async function getApiAuth(): Promise<
  { profile: ApiProfile; error?: never } | { profile?: never; error: NextResponse }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'לא מחובר' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('garage_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.garage_id) {
    return { error: NextResponse.json({ error: 'אין מוסך מקושר' }, { status: 403 }) }
  }

  return {
    profile: {
      userId: user.id,
      garageId: profile.garage_id,
      role: profile.role,
    }
  }
}
