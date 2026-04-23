'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { register } from '@/lib/actions/auth'
import { Scissors, Loader2, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    if (fd.get('password') !== fd.get('confirm')) {
      setError('Las contraseñas no coinciden.')
      return
    }
    startTransition(async () => {
      const res = await register(fd)
      if (res?.error) setError(res.error)
    })
  }

  const features = [
    'Tarjeta digital de 10 visitas',
    'Premio configurable por ti',
    'Email automático en cada visita',
    '14 días de prueba gratis',
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
            style={{ background: 'linear-gradient(135deg,#A07830,#C9A84C,#E8C87A)' }}>
            <Scissors className="w-7 h-7" style={{ color: '#111' }} />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Barber Loyalty</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Crea tu cuenta — 14 días gratis</p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-5">
          {features.map(f => (
            <div key={f} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
              style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--gold)' }}>
              <CheckCircle className="w-3 h-3" />
              {f}
            </div>
          ))}
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label">Nombre de tu barbería</label>
              <input name="shop_nombre" type="text" required placeholder="The Old Barbers" />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" required placeholder="admin@mibarber.com" />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input name="password" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" />
            </div>
            <div>
              <label className="label">Confirmar contraseña</label>
              <input name="confirm" type="password" required placeholder="Repite la contraseña" />
            </div>
            {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}
            <button type="submit" className="btn-gold mt-1" disabled={isPending}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
              Crear cuenta gratis
            </button>
          </form>
        </div>

        <p className="text-center mt-5" style={{ color: 'var(--muted)', fontSize: 14 }}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" style={{ color: 'var(--gold)', fontWeight: 600 }}>Ingresar</Link>
        </p>
        <p className="text-center mt-3" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>
          Al registrarte aceptas nuestros{' '}
          <Link href="/terms" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'underline' }}>Términos de Servicio</Link>
          {' '}y{' '}
          <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'underline' }}>Política de Privacidad</Link>
        </p>
      </div>
    </div>
  )
}
