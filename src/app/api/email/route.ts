import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/email
 * Body: { to: string, subject: string, html: string }
 *
 * If RESEND_API_KEY is set, sends via Resend API.
 * Otherwise logs the email to console (development mode).
 */
export async function POST(request: NextRequest) {
  let body: { to: string; subject: string; html: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  if (!body.to || !body.subject || !body.html) {
    return NextResponse.json({ error: 'חסרים שדות: to, subject, html' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const fromAddress = process.env.EMAIL_FROM ?? 'GarageOS <noreply@garageos.app>'

  // If no API key, log to console (development mode)
  if (!apiKey) {
    console.log('[Email - Dev Mode] Would send email:')
    console.log(`  To: ${body.to}`)
    console.log(`  Subject: ${body.subject}`)
    console.log(`  HTML length: ${body.html.length} chars`)
    return NextResponse.json({
      data: { id: 'dev-mode', status: 'logged' },
    })
  }

  // Send via Resend API
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [body.to],
        subject: body.subject,
        html: body.html,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      console.error('Resend API error:', errorBody)
      return NextResponse.json(
        { error: 'שגיאה בשליחת אימייל', detail: errorBody },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json({ data: { id: result.id, status: 'sent' } })
  } catch (err) {
    console.error('Email send error:', err)
    return NextResponse.json({ error: 'שגיאה בשליחת אימייל' }, { status: 500 })
  }
}
