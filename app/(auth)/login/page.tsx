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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Full-screen background image */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/barber-shop.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
      }} />

      {/* Gradient overlay: transparent top → near-black bottom */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.88) 70%, rgba(0,0,0,0.97) 100%)',
      }} />

      {/* Top brand mark */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '48px 24px 0',
        textAlign: 'center',
      }}>
        <div style={{
          width: 58, height: 58,
          borderRadius: 16,
          background: 'var(--yellow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px',
          boxShadow: '0 4px 24px rgba(245,197,0,0.35)',
        }}>
          <Scissors style={{ width: 26, height: 26, color: '#000' }} />
        </div>
        <h1 style={{
          fontSize: 30, fontWeight: 900, margin: '0 0 4px',
          fontFamily: 'var(--serif)',
          letterSpacing: '-0.02em',
          color: '#fff',
          textShadow: '0 2px 12px rgba(0,0,0,0.5)',
        }}>
          Barber Loyalty
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}>
          Sistema de fidelización
        </p>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Login card — glass, anchored to bottom */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '0 20px 32px',
        animation: 'fadeInUp 0.4s ease-out both',
      }}>
        <div style={{
          background: 'rgba(15,15,15,0.82)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: '28px 22px 24px',
          maxWidth: 420,
          margin: '0 auto',
          boxShadow: '0 -4px 60px rgba(0,0,0,0.5), 0 20px 60px rgba(0,0,0,0.6)',
        }}>
          <p style={{
            margin: '0 0 20px',
            fontSize: 18, fontWeight: 800,
            color: '#fff', fontFamily: 'var(--serif)',
          }}>
            Ingresa a tu panel
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="label">Email</label>
              <input
                name="email" type="email" required
                autoComplete="email"
                placeholder="admin@mibarber.com"
              />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input
                name="password" type="password" required
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p style={{
                color: '#f87171', fontSize: 13, margin: 0,
                padding: '8px 12px',
                background: 'rgba(248,113,113,0.08)',
                borderRadius: 8,
                border: '1px solid rgba(248,113,113,0.2)',
              }}>
                {error}
              </p>
            )}

            <button type="submit" className="btn-gold" disabled={isPending}
              style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {isPending && <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />}
              Ingresar
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 18, color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
            ¿No tienes cuenta?{' '}
            <Link href="/register" style={{
              color: 'var(--yellow)', fontWeight: 700, textDecoration: 'none',
            }}>
              Registra tu barbería
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
