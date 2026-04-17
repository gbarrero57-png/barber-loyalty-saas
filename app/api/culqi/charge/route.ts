import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { token_id, email, monto_centavos, concepto, shop_id, appointment_id } = await request.json()

    if (!token_id || !email || !monto_centavos || !shop_id) {
      return NextResponse.json({ ok: false, error: 'Datos incompletos' }, { status: 400 })
    }

    const secretKey = process.env.CULQI_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ ok: false, error: 'Pasarela no configurada' }, { status: 500 })
    }

    // Crear cargo en Culqi
    const culqiRes = await fetch('https://api.culqi.com/v2/charges', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount:        monto_centavos,
        currency_code: 'PEN',
        email,
        source_id:     token_id,
        capture:       true,
        description:   concepto ?? 'Pago de servicio',
        metadata: {
          shop_id,
          appointment_id: appointment_id ?? null,
        },
      }),
    })

    const charge = await culqiRes.json() as any

    if (!culqiRes.ok || charge.object === 'error') {
      return NextResponse.json({
        ok: false,
        error: charge.user_message ?? charge.merchant_message ?? 'Error al procesar el pago',
      })
    }

    // Guardar pago en Supabase
    const admin = createAdminClient()
    await admin.from('client_payments').insert({
      shop_id,
      appointment_id: appointment_id ?? null,
      culqi_charge_id: charge.id,
      email,
      monto: monto_centavos / 100,
      concepto: concepto ?? 'Pago de servicio',
      estado: 'pagado',
      metadata: { culqi_outcome: charge.outcome },
    })

    // Si hay cita, marcarla como completada
    if (appointment_id) {
      await admin
        .from('appointments')
        .update({ estado: 'completado' })
        .eq('id', appointment_id)
        .eq('shop_id', shop_id)
    }

    return NextResponse.json({ ok: true, charge_id: charge.id })

  } catch (err) {
    console.error('[culqi/charge]', err)
    return NextResponse.json({ ok: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
