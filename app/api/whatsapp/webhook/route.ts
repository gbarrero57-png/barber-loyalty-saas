import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { handleBotMessage } from '@/lib/bot/handler'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function twimlResponse(message: string): NextResponse {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message><Body>${escapeXml(message)}</Body></Message></Response>`
  return new NextResponse(xml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}

// Twilio HMAC-SHA1 signature validation
// https://www.twilio.com/docs/usage/webhooks/webhooks-security
function validateTwilioSignature(
  authToken: string,
  signature: string,
  url: string,
  params: Record<string, string>,
): boolean {
  const payload = Object.keys(params).sort()
    .reduce((acc, key) => acc + key + params[key], url)
  const expected = createHmac('sha1', authToken).update(payload).digest('base64')
  return expected === signature
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const params: Record<string, string> = {}
    formData.forEach((val, key) => { params[key] = String(val) })

    // Validate Twilio signature if auth token is configured
    const authToken = process.env.TWILIO_AUTH_TOKEN
    if (authToken) {
      const signature = request.headers.get('x-twilio-signature') ?? ''
      const url = request.url
      if (!validateTwilioSignature(authToken, signature, url, params)) {
        console.warn('[whatsapp/webhook] Invalid Twilio signature')
        return new NextResponse('Forbidden', { status: 403 })
      }
    }

    const from = (params['From'] ?? '').trim()   // whatsapp:+51987654321
    const to   = (params['To']   ?? '').trim()   // whatsapp:+13186683828
    const body = (params['Body'] ?? '').trim()

    if (!from || !to) return new NextResponse('', { status: 200 })

    const admin = createAdminClient()

    const rawNumber = to.replace('whatsapp:', '')
    const { data: shops } = await admin
      .from('shops')
      .select('*')
      .eq('bot_twilio_number', rawNumber)
      .eq('bot_enabled', true)
      .limit(1)

    const shop = shops?.[0] ?? null
    if (!shop) return new NextResponse('', { status: 200 })

    const { data: sub } = await admin
      .from('subscriptions')
      .select('plan, status')
      .eq('shop_id', shop.id)
      .single()

    if (sub?.plan !== 'phase2' || sub?.status === 'paused' || sub?.status === 'cancelled') {
      return new NextResponse('', { status: 200 })
    }

    const responseText = await handleBotMessage(from, body, shop)
    return twimlResponse(responseText)

  } catch (err) {
    console.error('[whatsapp/webhook]', err)
    return twimlResponse('Servicio temporalmente no disponible. Inténtalo de nuevo en unos minutos.')
  }
}

// Twilio hace GET para verificar el endpoint
export async function GET() {
  return new NextResponse('OK', { status: 200 })
}
