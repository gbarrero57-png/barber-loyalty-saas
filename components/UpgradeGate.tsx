import Link from 'next/link'
import { Lock, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Props {
  feature: string
  description: string
  icon: LucideIcon
  bullets?: string[]
  hint?: string        // pequeño texto extra, ej: "Incluye bot WhatsApp"
}

export default function UpgradeGate({ feature, description, icon: Icon, bullets, hint }: Props) {
  return (
    <div style={{
      position: 'relative',
      borderRadius: 22,
      overflow: 'hidden',
      border: '1.5px solid rgba(245,197,0,0.18)',
    }}>
      {/* Blurred preview background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(245,197,0,0.04) 0%, rgba(0,0,0,0) 60%)',
        backdropFilter: 'blur(1px)',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        padding: '32px 24px 28px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', gap: 0,
      }}>

        {/* Icon stack: feature icon + lock badge */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'rgba(245,197,0,0.08)',
            border: '1.5px solid rgba(245,197,0,0.16)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon style={{ width: 28, height: 28, color: 'rgba(245,197,0,0.5)' }} />
          </div>
          <div style={{
            position: 'absolute', bottom: -6, right: -6,
            width: 24, height: 24, borderRadius: 8,
            background: '#0A0A0A',
            border: '1.5px solid rgba(245,197,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Lock style={{ width: 11, height: 11, color: 'var(--yellow)' }} />
          </div>
        </div>

        {/* Badge */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'rgba(245,197,0,0.12)',
          border: '1px solid rgba(245,197,0,0.25)',
          borderRadius: 999, padding: '3px 12px',
          fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
          color: 'var(--yellow)', textTransform: 'uppercase',
          marginBottom: 14,
        }}>
          <Zap style={{ width: 9, height: 9 }} /> Barber Pro
        </span>

        <h2 style={{
          margin: '0 0 8px', fontWeight: 900, fontSize: 20,
          color: 'var(--text)', fontFamily: 'var(--serif)',
          letterSpacing: '-0.02em',
        }}>
          {feature}
        </h2>

        <p style={{
          margin: '0 0 20px', fontSize: 13, color: 'var(--muted)',
          lineHeight: 1.6, maxWidth: 320,
        }}>
          {description}
        </p>

        {/* Feature bullets */}
        {bullets && bullets.length > 0 && (
          <div style={{
            width: '100%', maxWidth: 300,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14, padding: '14px 16px',
            marginBottom: 22,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {bullets.map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 6, flexShrink: 0,
                  background: 'var(--yellow)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 9, fontWeight: 900, color: '#000' }}>✓</span>
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>{b}</span>
              </div>
            ))}
          </div>
        )}

        {hint && (
          <p style={{ margin: '0 0 18px', fontSize: 11, color: 'rgba(245,197,0,0.6)', fontWeight: 600 }}>
            ✦ {hint}
          </p>
        )}

        <Link href="/upgrade" style={{ textDecoration: 'none', width: '100%', maxWidth: 300 }}>
          <button style={{
            width: '100%', background: 'var(--yellow)', color: '#000',
            border: 'none', borderRadius: 999, padding: '14px 0',
            fontSize: 14, fontWeight: 900, cursor: 'pointer',
            letterSpacing: '0.03em', fontFamily: 'var(--sans)',
            boxShadow: '0 4px 20px rgba(245,197,0,0.3)',
            transition: 'opacity 0.15s, transform 0.15s',
          }}>
            Activar Barber Pro →
          </button>
        </Link>

        <p style={{ margin: '12px 0 0', fontSize: 11, color: 'var(--muted)' }}>
          S/79/mes · Cancela cuando quieras
        </p>
      </div>
    </div>
  )
}
