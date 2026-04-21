import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

async function stripePost(path: string, params: Record<string, string>, secretKey: string) {
  const body = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${secretKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message ?? `Stripe error ${res.status}`)
  return data
}

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 })

  try {
    const { monto_centavos, concepto, shop_id, appointment_id } = await request.json()

    if (!monto_centavos || !shop_id) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: shop } = await admin.from('shops').select('id').eq('id', shop_id).single()
    if (!shop) return NextResponse.json({ error: 'Barbería no encontrada' }, { status: 404 })

    const pi = await stripePost('/payment_intents', {
      amount:                        String(monto_centavos),
      currency:                      'pen',
      description:                   concepto ?? 'Pago de servicio',
      'automatic_payment_methods[enabled]': 'true',
      'metadata[shop_id]':           shop_id,
      'metadata[appointment_id]':    appointment_id ?? '',
    }, secretKey)

    return NextResponse.json({ clientSecret: pi.client_secret })
  } catch (err: any) {
    console.error('[stripe/create-intent]', err)
    return NextResponse.json({ error: err?.message ?? 'Error al crear intención de pago' }, { status: 500 })
  }
}
