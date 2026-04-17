'use client'

import { useState, useTransition } from 'react'
import { superAdminLogin } from '@/lib/actions/superadmin'
import { Shield, Loader2 } from 'lucide-react'

export default function SuperAdminLogin() {
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await superAdminLogin(fd)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#0a0a0a' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 14, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', marginBottom: 12 }}>
            <Shield className="w-6 h-6" style={{ color: '#818cf8' }} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>SuperAdmin</h1>
          <p style={{ color: '#666', fontSize: 13, margin: '4px 0 0' }}>Panel de administración</p>
        </div>

        <div style={{ background: '#141414', border: '1px solid #222', borderRadius: 14, padding: 24 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Email</label>
              <input name="email" type="email" required placeholder="admin@redsolucionesti.com"
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Contraseña</label>
              <input name="password" type="password" required
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            {error && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>}
            <button type="submit" disabled={isPending}
              style={{ background: '#4f46e5', border: 'none', borderRadius: 8, padding: '11px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1 }}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
