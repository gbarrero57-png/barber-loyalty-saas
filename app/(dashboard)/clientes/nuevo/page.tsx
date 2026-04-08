'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createClientAction } from '@/lib/actions/clients'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function NuevoClientePage() {
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await createClientAction(fd)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 13, textDecoration: 'none', marginBottom: 16 }}>
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <h1 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 20px' }}>Nuevo Cliente</h1>

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">DNI o CE *</label>
            <input name="dni_ce" required placeholder="12345678" />
          </div>
          <div>
            <label className="label">Nombre completo *</label>
            <input name="nombre" required placeholder="Juan Pérez" />
          </div>
          <div>
            <label className="label">Email *</label>
            <input name="email" type="email" required placeholder="juan@email.com" />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input name="telefono" placeholder="999 888 777" />
          </div>
          {error && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>}
          <button type="submit" className="btn-gold" disabled={isPending}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Registrar cliente
          </button>
        </form>
      </div>
    </div>
  )
}
