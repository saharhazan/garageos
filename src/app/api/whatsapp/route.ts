import { NextRequest, NextResponse } from 'next/server'

function normalizeIsraeliPhone(phone: string): string {
  let normalized = phone.replace(/[\s\-()]/g, '')

  if (normalized.startsWith('+972')) return normalized.slice(1) // Evolution API uses without +
  if (normalized.startsWith('972')) return normalized
  if (normalized.startsWith('0')) return `972${normalized.slice(1)}`
  return `972${normalized}`
}

export async function POST(request: NextRequest) {
  const evolutionUrl = process.env.EVOLUTION_API_URL
  const evolutionInstance = process.env.EVOLUTION_INSTANCE
  const evolutionApiKey = process.env.EVOLUTION_API_KEY

  if (!evolutionUrl || !evolutionInstance || !evolutionApiKey) {
    return NextResponse.json({ error: 'Evolution API לא מוגדר' }, { status: 500 })
  }

  let body: { to: string; message: string; pdfBase64?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  if (!body.to || !body.message) {
    return NextResponse.json({ error: 'חסרים שדות: to, message' }, { status: 400 })
  }

  const to = normalizeIsraeliPhone(body.to)

  // Send text message
  const textResponse = await fetch(
    `${evolutionUrl}/message/sendText/${evolutionInstance}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: evolutionApiKey,
      },
      body: JSON.stringify({
        number: to,
        text: body.message,
      }),
    }
  )

  if (!textResponse.ok) {
    const errorBody = await textResponse.json().catch(() => ({}))
    console.error('Evolution API error:', errorBody)
    return NextResponse.json(
      { error: 'שגיאה בשליחת WhatsApp', detail: errorBody },
      { status: textResponse.status }
    )
  }

  // If PDF is provided, send as document
  if (body.pdfBase64) {
    const docResponse = await fetch(
      `${evolutionUrl}/message/sendMedia/${evolutionInstance}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: evolutionApiKey,
        },
        body: JSON.stringify({
          number: to,
          mediatype: 'document',
          mimetype: 'application/pdf',
          media: body.pdfBase64,
          fileName: 'order.pdf',
          caption: '',
        }),
      }
    )

    if (!docResponse.ok) {
      const errorBody = await docResponse.json().catch(() => ({}))
      console.error('Evolution API doc error (non-fatal):', errorBody)
      // Return partial success — text was sent
      return NextResponse.json({
        data: { success: true, pdfSent: false },
      })
    }
  }

  return NextResponse.json({ data: { success: true, pdfSent: !!body.pdfBase64 } })
}
