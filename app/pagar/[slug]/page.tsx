import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import StripeCheckout from './checkout'

export default async function PagarPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ appt?: string; monto?: string; concepto?: string }>
}) {
  const { slug }                       = await params
  const { appt, monto: montoQ, concepto: conceptoQ } = await searchParams

  const admin = createAdminClient()

  const { data: shop } = await admin
    .from('shops')
    .select('id, nombre, color_primario, active')
    .eq('slug', slug)
    .single()

  if (!shop || !shop.active) notFound()

  // Si viene de una cita específica
  let monto    = parseFloat(montoQ ?? '0') || 0
  let concepto = conceptoQ ?? 'Pago de servicio'
  let clientEmail: string | undefined

  if (appt) {
    const { data: appointment } = await admin
      .from('appointments')
      .select('id, precio, client_tel, services(nombre), client_nombre')
      .eq('id', appt)
      .eq('shop_id', shop.id)
      .single()

    if (appointment) {
      monto    = Number(appointment.precio ?? 0)
      concepto = (appointment.services as any)?.nombre ?? concepto
    }
  }

  if (!monto || monto <= 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ color: '#f87171', fontSize: 14 }}>Link de pago inválido o sin monto.</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: shop.color_primario, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 12 }}>
            💈
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 4px' }}>{shop.nombre}</h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>Pago seguro</p>
        </div>

        {/* Card de pago */}
        <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 16, padding: 24 }}>
          <StripeCheckout
            shopId={shop.id}
            monto={monto}
            concepto={concepto}
            appointmentId={appt}
          />
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#374151', marginTop: 16 }}>
          Al pagar aceptas los términos de servicio de {shop.nombre}
        </p>
      </div>
    </div>
  )
}
