import { NextRequest, NextResponse } from 'next/server'

function normalizeIsraeliPhone(phone: string): string {
  // Strip all spaces and dashes
  let normalized = phone.replace(/[\s\-()]/g, '')

  // Already has +972
  if (normalized.startsWith('+972')) return normalized

  // Has 972 without +
  if (normalized.startsWith('972')) return `+${normalized}`

  // Local 05X format → +9725X
  if (normalized.startsWith('0')) return `+972${normalized.slice(1)}`

  return `+972${normalized}`
}

export async function POST(request: NextRequest) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_FROM_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    return NextResponse.json({ error: 'Twilio לא מוגדר' }, { status: 500 })
  }

  let body: { to: string; message: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  if (!body.to || !body.message) {
    return NextResponse.json({ error: 'חסרים שדות: to, message' }, { status: 400 })
  }

  const to = normalizeIsraeliPhone(body.to)
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

  const formData = new URLSearchParams()
  formData.set('To', to)
  formData.set('From', fromNumber)
  formData.set('Body', body.message)

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    }
  )

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    console.error('Twilio error:', errorBody)
    return NextResponse.json(
      { error: 'שגיאה בשליחת SMS', detail: errorBody },
      { status: response.status }
    )
  }

  const result = await response.json()
  return NextResponse.json({ data: { sid: result.sid, status: result.status } })
}
