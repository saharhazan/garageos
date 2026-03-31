import { createClient } from '@/lib/supabase/server'

export interface AuthProfile {
  userId: string
  garageId: string
  fullName: string
  role: string
}

export async function getAuthProfile(): Promise<AuthProfile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('garage_id, full_name, role')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return {
    userId: user.id,
    garageId: profile.garage_id,
    fullName: profile.full_name,
    role: profile.role,
  }
}
