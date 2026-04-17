import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const from = (formData.get('From') as string ?? '').trim()   // whatsapp:+51987654321
    const to   = (formData.get('To')   as string ?? '').trim()   // whatsapp:+13186683828
    const body = (formData.get('Body') as string ?? '').trim()

    if (!from || !to) return new NextResponse('', { status: 200 })

    const admin = createAdminClient()

    // Buscar barbería por número Twilio (bot_twilio_number)
    const rawNumber = to.replace('whatsapp:', '')
    const { data: shop } = await admin
      .from('shops')
      .select('*')
      .eq('bot_twilio_number', rawNumber)
      .eq('bot_enabled', true)
      .single()

    if (!shop) {
      // No hay barbería con ese número — no responder (evitar spam)
      return new NextResponse('', { status: 200 })
    }

    // Phase 2 check
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

// Twilio también hace GET para verificar el endpoint
export async function GET() {
  return new NextResponse('OK', { status: 200 })
}
