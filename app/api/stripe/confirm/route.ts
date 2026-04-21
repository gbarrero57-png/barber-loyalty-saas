import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendReciboPago } from '@/lib/email/sender'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) return NextResponse.json({ ok: false, error: 'Stripe no configurado' }, { status: 500 })

  try {
    const { payment_intent_id, shop_id, appointment_id } = await request.json()

    if (!payment_intent_id || !shop_id) {
      return NextResponse.json({ ok: false, error: 'Datos incompletos' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: shop } = await admin.from('shops').select('id, nombre').eq('id', shop_id).single()
    if (!shop) return NextResponse.json({ ok: false, error: 'Barbería no encontrada' }, { status: 404 })

    // Verificar con Stripe directamente — nunca confiar solo en el cliente
    const res = await fetch(`https://api.stripe.com/v1/payment_intents/${payment_intent_id}`, {
      headers: { 'Authorization': `Bearer ${secretKey}` },
      cache: 'no-store',
    })
    const pi = await res.json()
    if (!res.ok) throw new Error(pi?.error?.message ?? `Stripe error ${res.status}`)

    if (pi.status !== 'succeeded') {
      return NextResponse.json({ ok: false, error: `Estado del pago: ${pi.status}` }, { status: 402 })
    }

    await admin.from('client_payments').insert({
      shop_id,
      appointment_id:  appointment_id || null,
      culqi_charge_id: pi.id,
      email:           pi.receipt_email ?? null,
      monto:           pi.amount / 100,
      concepto:        pi.description ?? 'Pago de servicio',
      estado:          'pagado',
      metadata:        { stripe_pi: pi.id, stripe_status: pi.status },
    })

    if (appointment_id) {
      await admin.from('appointments')
        .update({ estado: 'completado' })
        .eq('id', appointment_id)
        .eq('shop_id', shop_id)
    }

    if (pi.receipt_email) {
      await sendReciboPago(
        pi.receipt_email,
        pi.receipt_email.split('@')[0],
        (shop as any).nombre,
        pi.description ?? 'Pago de servicio',
        pi.amount / 100,
        pi.id,
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[stripe/confirm]', err)
    return NextResponse.json({ ok: false, error: err?.message ?? 'Error interno' }, { status: 500 })
  }
}
