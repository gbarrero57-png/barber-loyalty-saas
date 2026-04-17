import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 })
  }

  try {
    const { monto_centavos, concepto, shop_id, appointment_id } = await request.json()

    if (!monto_centavos || !shop_id) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const stripe = new Stripe(secretKey)

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   monto_centavos,
      currency: 'pen',
      description: concepto ?? 'Pago de servicio',
      automatic_payment_methods: { enabled: true },
      metadata: {
        shop_id,
        appointment_id: appointment_id ?? '',
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error('[stripe/create-intent]', err)
    return NextResponse.json({ error: 'Error al crear intención de pago' }, { status: 500 })
  }
}
