'use client'

import { useState } from 'react'

export default function UpgradeCTA({ isPhase2 }: { isPhase2: boolean }) {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      alert(data.error ?? 'Error al iniciar el pago')
      setLoading(false)
    }
  }

  async function handlePortal() {
    setLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      alert(data.error ?? 'Error al abrir el portal')
      setLoading(false)
    }
  }

  if (isPhase2) {
    return (
      <button
        onClick={handlePortal}
        disabled={loading}
        style={{
          width: '100%', background: 'rgba(245,197,0,0.12)', border: '1px solid rgba(245,197,0,0.2)',
          borderRadius: 999, padding: '13px 0', textAlign: 'center',
          fontSize: 14, fontWeight: 800, color: 'var(--yellow)', cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--sans)', letterSpacing: '0.03em', opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Cargando…' : '✓ Gestionar suscripción →'}
      </button>
    )
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      style={{
        width: '100%', background: 'var(--yellow)', color: '#000',
        border: 'none', borderRadius: 999, padding: '14px 0',
        fontSize: 15, fontWeight: 900, cursor: loading ? 'not-allowed' : 'pointer',
        letterSpacing: '0.03em', fontFamily: 'var(--sans)',
        boxShadow: '0 6px 28px rgba(245,197,0,0.35)',
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? 'Cargando…' : 'Activar Barber Pro →'}
    </button>
  )
}
