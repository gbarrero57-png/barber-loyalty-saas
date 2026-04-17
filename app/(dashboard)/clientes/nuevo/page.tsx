'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createClientAction } from '@/lib/actions/clients'
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react'

export default function NuevoClientePage() {
  const [error, setError]     = useState('')
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
      <Link href="/clientes" className="link-back" style={{ marginBottom: 18, display: 'inline-flex' }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Clientes
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <UserPlus className="w-5 h-5" style={{ color: 'var(--gold)' }} />
        </div>
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Nuevo Cliente</h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>Completa los datos del cliente</p>
        </div>
      </div>

      <div className="section-card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="input-label">DNI o CE *</label>
              <input name="dni_ce" required placeholder="12345678" />
            </div>
            <div>
              <label className="input-label">Teléfono</label>
              <input name="telefono" placeholder="999 888 777" />
            </div>
          </div>
          <div>
            <label className="input-label">Nombre completo *</label>
            <input name="nombre" required placeholder="Juan Pérez" />
          </div>
          <div>
            <label className="input-label">Email *</label>
            <input name="email" type="email" required placeholder="juan@email.com" />
          </div>

          {error && (
            <p style={{
              color: '#f87171', fontSize: 13, margin: 0,
              padding: '8px 12px', background: 'rgba(248,113,113,0.08)',
              borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)',
            }}>
              {error}
            </p>
          )}

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
