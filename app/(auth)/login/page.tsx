'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { login } from '@/lib/actions/auth'
import { Scissors, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await login(fd)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg,#A07830,#C9A84C,#E8C87A)' }}>
            <Scissors className="w-7 h-7" style={{ color: '#111' }} />
          </div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
            Barber Loyalty
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Ingresa a tu panel</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" required autoComplete="email" placeholder="admin@mibarber.com" />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input name="password" type="password" required placeholder="••••••••" />
            </div>
            {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}
            <button type="submit" className="btn-gold mt-1" disabled={isPending}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
              Ingresar
            </button>
          </form>
        </div>

        <p className="text-center mt-5" style={{ color: 'var(--muted)', fontSize: 14 }}>
          ¿No tienes cuenta?{' '}
          <Link href="/register" style={{ color: 'var(--gold)', fontWeight: 600 }}>
            Registra tu barbería
          </Link>
        </p>
      </div>
    </div>
  )
}
