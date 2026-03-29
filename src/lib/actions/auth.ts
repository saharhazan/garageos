'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signInAction(
  email: string,
  password: string
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message === 'Invalid login credentials') {
      return { error: 'אימייל או סיסמה שגויים' }
    }
    return { error: error.message }
  }

  return {}
}

export async function signInWithPhoneAction(
  phone: string
): Promise<{ error?: string }> {
  const supabase = await createClient()

  // Normalize Israeli phone
  let normalized = phone.replace(/[\s\-()]/g, '')
  if (normalized.startsWith('0')) normalized = `+972${normalized.slice(1)}`
  else if (!normalized.startsWith('+')) normalized = `+972${normalized}`

  const { error } = await supabase.auth.signInWithOtp({
    phone: normalized,
  })

  if (error) {
    return { error: error.message }
  }

  return {}
}

export async function verifyOtpAction(
  phone: string,
  token: string
): Promise<{ error?: string }> {
  const supabase = await createClient()

  let normalized = phone.replace(/[\s\-()]/g, '')
  if (normalized.startsWith('0')) normalized = `+972${normalized.slice(1)}`
  else if (!normalized.startsWith('+')) normalized = `+972${normalized}`

  const { error } = await supabase.auth.verifyOtp({
    phone: normalized,
    token,
    type: 'sms',
  })

  if (error) {
    if (error.message.includes('Token has expired') || error.message.includes('invalid')) {
      return { error: 'קוד לא תקין או פג תוקף' }
    }
    return { error: error.message }
  }

  return {}
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
