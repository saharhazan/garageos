import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-03-25.dahlia',
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'לא מורשה' }, { status: 401 })
  }

  let body: { garage_id: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  if (!body.garage_id) {
    return NextResponse.json({ error: 'חסר שדה חובה: garage_id' }, { status: 400 })
  }

  // Verify user belongs to this garage
  const { data: profile } = await supabase
    .from('users')
    .select('garage_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.garage_id !== body.garage_id) {
    return NextResponse.json({ error: 'אין הרשאה למוסך זה' }, { status: 403 })
  }

  // Get Stripe customer ID from garage
  const { data: garage } = await supabase
    .from('garages')
    .select('stripe_customer_id')
    .eq('id', body.garage_id)
    .single()

  if (!garage?.stripe_customer_id) {
    return NextResponse.json({ error: 'לא נמצא מנוי פעיל' }, { status: 404 })
  }

  const stripe = getStripe()
  const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? ''

  const session = await stripe.billingPortal.sessions.create({
    customer: garage.stripe_customer_id,
    return_url: `${origin}/dashboard/settings`,
  })

  return NextResponse.json({ url: session.url })
}
