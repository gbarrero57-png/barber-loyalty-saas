'use client'

import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Loader2, CheckCircle, Lock } from 'lucide-react'

// Inicializar Stripe una sola vez fuera del render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ?? '')

/* ── Formulario interno (dentro de <Elements>) ── */
function CheckoutForm({
  monto,
  concepto,
  shopId,
  appointmentId,
  onSuccess,
}: {
  monto: number
  concepto: string
  shopId: string
  appointmentId?: string
  onSuccess: () => void
}) {
  const stripe   = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError('')

    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',  // evita redirección para tarjetas normales
    })

    if (result.error) {
      setError(result.error.message ?? 'Error al procesar el pago')
      setLoading(false)
      return
    }

    if (result.paymentIntent?.status === 'succeeded') {
      // Confirmar en servidor (verificación server-side con secret key)
      const res = await fetch('/api/stripe/confirm', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_intent_id: result.paymentIntent.id,
          shop_id:           shopId,
          appointment_id:    appointmentId ?? null,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        onSuccess()
      } else {
        setError(data.error ?? 'Error al confirmar el pago')
      }
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card'],
        }}
      />

      {error && (
        <div style={{
          marginTop: 14,
          background: 'rgba(248,113,113,0.08)',
          border: '1px solid rgba(248,113,113,0.25)',
          borderRadius: 10,
          padding: '10px 14px',
          fontSize: 13,
          color: '#f87171',
        }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        style={{
          marginTop: 20,
          width: '100%',
          padding: '14px',
          borderRadius: 12,
          border: 'none',
          background: !stripe || loading
            ? 'rgba(201,168,76,0.3)'
            : 'linear-gradient(135deg, #8A6420, #C9A84C, #E8C87A)',
          color: !stripe || loading ? 'rgba(255,255,255,0.4)' : '#0C0C0C',
          fontSize: 15,
          fontWeight: 800,
          cursor: !stripe || loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          letterSpacing: '0.04em',
          transition: 'opacity 0.2s',
        }}
      >
        {loading
          ? <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Procesando...</>
          : `Pagar S/ ${monto.toFixed(2)}`
        }
      </button>

      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
        <Lock style={{ width: 11, height: 11, color: '#4b5563' }} />
        <span style={{ fontSize: 11, color: '#4b5563' }}>Pago seguro procesado por Stripe</span>
      </div>
    </form>
  )
}

/* ── Componente principal exportado ── */
export default function StripeCheckout({
  shopId,
  monto,
  concepto,
  appointmentId,
}: {
  shopId: string
  monto: number
  concepto: string
  appointmentId?: string
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paid, setPaid]                 = useState(false)
  const [initError, setInitError]       = useState('')

  useEffect(() => {
    fetch('/api/stripe/create-intent', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monto_centavos: Math.round(monto * 100),
        concepto,
        shop_id:        shopId,
        appointment_id: appointmentId ?? null,
      }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.clientSecret) setClientSecret(d.clientSecret)
        else setInitError(d.error ?? 'Error al iniciar el pago')
      })
      .catch(() => setInitError('Error de conexión'))
  }, [monto, concepto, shopId, appointmentId])

  /* Estado: éxito */
  if (paid) {
    return (
      <div style={{ textAlign: 'center', padding: '36px 16px' }}>
        <CheckCircle style={{ width: 52, height: 52, color: '#34d399', margin: '0 auto 16px' }} />
        <h2 style={{ margin: '0 0 8px', fontWeight: 900, fontSize: 20, color: '#F0EDE6' }}>
          ¡Pago exitoso!
        </h2>
        <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>
          Tu pago de <strong style={{ color: '#F0EDE6' }}>S/ {monto.toFixed(2)}</strong> fue procesado correctamente.
        </p>
      </div>
    )
  }

  /* Estado: error al iniciar */
  if (initError) {
    return (
      <div style={{ textAlign: 'center', padding: 24, color: '#f87171', fontSize: 14 }}>
        {initError}
      </div>
    )
  }

  /* Estado: cargando PaymentIntent */
  if (!clientSecret) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Loader2 style={{ width: 28, height: 28, color: 'var(--gold)', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  /* Estado: listo para pagar */
  return (
    <div>
      {/* Monto */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <p style={{ margin: '0 0 4px', fontSize: 30, fontWeight: 900, color: '#F0EDE6', letterSpacing: '-0.02em' }}>
          S/ {monto.toFixed(2)}
        </p>
        <p style={{ margin: 0, fontSize: 14, color: '#9ca3af' }}>{concepto}</p>
      </div>

      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: 'night',
            variables: {
              colorPrimary:    '#C9A84C',
              colorBackground: '#1A1A1A',
              colorText:       '#F0EDE6',
              colorDanger:     '#f87171',
              fontFamily:      'Inter, system-ui, sans-serif',
              borderRadius:    '10px',
            },
          },
        }}
      >
        <CheckoutForm
          monto={monto}
          concepto={concepto}
          shopId={shopId}
          appointmentId={appointmentId}
          onSuccess={() => setPaid(true)}
        />
      </Elements>
    </div>
  )
}
