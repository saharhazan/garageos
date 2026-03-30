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

  let body: { plan: 'pro' | 'business'; garage_id: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  if (!body.plan || !body.garage_id) {
    return NextResponse.json({ error: 'חסרים שדות חובה: plan, garage_id' }, { status: 400 })
  }

  const planPrices: Record<string, string | undefined> = {
    pro: process.env.STRIPE_PRICE_PRO,
    business: process.env.STRIPE_PRICE_BUSINESS,
  }

  const priceId = planPrices[body.plan]
  if (!priceId) {
    return NextResponse.json({ error: 'תוכנית לא תקינה' }, { status: 400 })
  }

  // Verify user belongs to this garage
  const { data: profile } = await supabase
    .from('users')
    .select('garage_id, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.garage_id !== body.garage_id) {
    return NextResponse.json({ error: 'אין הרשאה למוסך זה' }, { status: 403 })
  }

  // Check if garage already has a Stripe customer
  const { data: garage } = await supabase
    .from('garages')
    .select('stripe_customer_id, name')
    .eq('id', body.garage_id)
    .single()

  const stripe = getStripe()

  let customerId = garage?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: garage?.name ?? profile.full_name,
      metadata: { garage_id: body.garage_id },
    })
    customerId = customer.id
  }

  const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? ''

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard/settings?billing=success`,
    cancel_url: `${origin}/dashboard/settings?billing=cancelled`,
    metadata: {
      garage_id: body.garage_id,
      plan: body.plan === 'business' ? 'enterprise' : body.plan,
    },
  })

  return NextResponse.json({ url: session.url })
}
