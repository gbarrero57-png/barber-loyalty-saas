import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json({ ok: false, error: 'Stripe no configurado' }, { status: 500 })
  }

  try {
    const { payment_intent_id, shop_id, appointment_id } = await request.json()

    if (!payment_intent_id || !shop_id) {
      return NextResponse.json({ ok: false, error: 'Datos incompletos' }, { status: 400 })
    }

    const stripe = new Stripe(secretKey)

    // Verificar con Stripe — nunca confiar solo en el cliente
    const pi = await stripe.paymentIntents.retrieve(payment_intent_id)

    if (pi.status !== 'succeeded') {
      return NextResponse.json({ ok: false, error: `Estado del pago: ${pi.status}` })
    }

    // Guardar en Supabase
    const admin = createAdminClient()
    await admin.from('client_payments').insert({
      shop_id,
      appointment_id:  appointment_id || null,
      culqi_charge_id: pi.id,               // columna reutilizada para Stripe PI ID
      email:           pi.receipt_email ?? null,
      monto:           pi.amount / 100,
      concepto:        pi.description ?? 'Pago de servicio',
      estado:          'pagado',
      metadata:        { stripe_pi: pi.id, stripe_status: pi.status },
    })

    // Marcar cita como completada
    if (appointment_id) {
      await admin
        .from('appointments')
        .update({ estado: 'completado' })
        .eq('id', appointment_id)
        .eq('shop_id', shop_id)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[stripe/confirm]', err)
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 })
  }
}
