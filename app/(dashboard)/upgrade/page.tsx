import Link from 'next/link'
import { getMyShop } from '@/lib/actions/shop'
import {
  Check, Zap, Lock, MessageCircle, CalendarDays,
  Wallet, BarChart2, Users, Bell, CreditCard, Scissors, Star
} from 'lucide-react'

const PHASE1 = [
  'Registrar visitas',
  'Tarjeta de sellos digital',
  'Hasta 30 clientes',
  '1 barbero',
  'Premio por defecto',
]

const PHASE2 = [
  'Todo de Básico incluido',
  'Clientes ilimitados',
  'Múltiples barberos',
  'Agenda de citas completa',
  'Bot WhatsApp para agendar',
  'Recordatorios automáticos 24h',
  'Caja y control de finanzas',
  'Cobros en línea (Stripe)',
  'Notificaciones WhatsApp y Email',
  'Reportes y análisis del negocio',
  'Premios personalizables por tarjeta',
]

const FEATURES = [
  { icon: CalendarDays, label: 'Agenda de citas', phase1: false, phase2: true },
  { icon: MessageCircle, label: 'Bot WhatsApp agendamiento', phase1: false, phase2: true },
  { icon: Bell, label: 'Recordatorios automáticos', phase1: false, phase2: true },
  { icon: Wallet, label: 'Caja / finanzas', phase1: false, phase2: true },
  { icon: CreditCard, label: 'Cobros en línea', phase1: false, phase2: true },
  { icon: BarChart2, label: 'Reportes del negocio', phase1: false, phase2: true },
  { icon: Users, label: 'Múltiples barberos', phase1: false, phase2: true },
  { icon: Scissors, label: 'Registro de visitas', phase1: true, phase2: true },
  { icon: Star, label: 'Tarjeta de sellos', phase1: true, phase2: true },
]

export const dynamic = 'force-dynamic'

export default async function UpgradePage() {
  const shop = await getMyShop()
  const isPhase2 = shop?.subscription_plan === 'phase2'

  return (
    <div style={{ paddingBottom: 32 }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(245,197,0,0.12)', border: '1px solid rgba(245,197,0,0.25)',
          borderRadius: 999, padding: '4px 14px', marginBottom: 16,
          fontSize: 11, fontWeight: 800, letterSpacing: '0.1em',
          color: 'var(--yellow)', textTransform: 'uppercase',
        }}>
          <Zap style={{ width: 10, height: 10 }} /> Planes
        </span>
        <h1 style={{
          margin: '0 0 10px', fontSize: 28, fontWeight: 900,
          fontFamily: 'var(--serif)', letterSpacing: '-0.02em', color: 'var(--text)',
        }}>
          Lleva tu barbería<br />al siguiente nivel
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
          El bot de WhatsApp solo tarda 5 minutos en configurarse<br />y trabaja por ti 24/7.
        </p>
      </div>

      {/* Plan cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>

        {/* Phase 1 — Básico */}
        <div style={{
          borderRadius: 22, padding: '22px 20px',
          background: 'rgba(12,12,12,0.72)',
          backdropFilter: 'blur(14px)',
          border: '1.5px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Básico</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: 'var(--text)' }}>
                Gratis
              </p>
            </div>
            {!isPhase2 && (
              <span style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: 'var(--muted)',
              }}>
                Plan actual
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {PHASE1.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 18, height: 18, borderRadius: 6, flexShrink: 0, background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check style={{ width: 10, height: 10, color: 'var(--muted)' }} />
                </div>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>{f}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.4 }}>
              <div style={{ width: 18, height: 18, borderRadius: 6, flexShrink: 0, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock style={{ width: 10, height: 10, color: 'var(--muted)' }} />
              </div>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Bot WhatsApp, Agenda, Caja y más…</span>
            </div>
          </div>
        </div>

        {/* Phase 2 — Pro */}
        <div style={{
          borderRadius: 22, padding: '22px 20px',
          background: 'linear-gradient(135deg, rgba(20,16,5,0.95) 0%, rgba(30,24,8,0.95) 100%)',
          backdropFilter: 'blur(14px)',
          border: '2px solid rgba(245,197,0,0.35)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Glow */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,197,0,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Popular badge */}
          <div style={{
            position: 'absolute', top: 16, right: 16,
            background: 'var(--yellow)', borderRadius: 999,
            padding: '3px 10px', fontSize: 10, fontWeight: 900, color: '#000',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            ⚡ Recomendado
          </div>

          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: 'rgba(245,197,0,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Barber Pro</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <p style={{ margin: 0, fontSize: 36, fontWeight: 900, color: 'var(--yellow)', fontFamily: 'var(--serif)' }}>S/79</p>
              <span style={{ fontSize: 13, color: 'rgba(245,197,0,0.5)', fontWeight: 600 }}>/mes</span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(245,197,0,0.4)' }}>≈ S/2.63/día · Menos que un café</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 22 }}>
            {PHASE2.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 18, height: 18, borderRadius: 6, flexShrink: 0, background: 'var(--yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check style={{ width: 10, height: 10, color: '#000' }} />
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>

          {isPhase2 ? (
            <div style={{
              width: '100%', background: 'rgba(245,197,0,0.12)', border: '1px solid rgba(245,197,0,0.2)',
              borderRadius: 999, padding: '13px 0', textAlign: 'center',
              fontSize: 14, fontWeight: 800, color: 'var(--yellow)',
            }}>
              ✓ Plan activo
            </div>
          ) : (
            <button style={{
              width: '100%', background: 'var(--yellow)', color: '#000',
              border: 'none', borderRadius: 999, padding: '14px 0',
              fontSize: 15, fontWeight: 900, cursor: 'pointer',
              letterSpacing: '0.03em', fontFamily: 'var(--sans)',
              boxShadow: '0 6px 28px rgba(245,197,0,0.35)',
            }}>
              Activar Barber Pro →
            </button>
          )}
          <p style={{ margin: '12px 0 0', fontSize: 11, color: 'rgba(245,197,0,0.4)', textAlign: 'center' }}>
            Sin contrato · Cancela cuando quieras
          </p>
        </div>
      </div>

      {/* Feature comparison table */}
      <div style={{
        borderRadius: 20, overflow: 'hidden',
        background: 'rgba(12,12,12,0.72)', backdropFilter: 'blur(14px)',
        border: '1.5px solid rgba(255,255,255,0.07)',
        marginBottom: 24,
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 80px 80px',
          padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Feature</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center' }}>Básico</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--yellow)', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center' }}>Pro</span>
        </div>
        {FEATURES.map(({ icon: Icon, label, phase1, phase2 }) => (
          <div key={label} style={{
            display: 'grid', gridTemplateColumns: '1fr 80px 80px',
            padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <Icon style={{ width: 14, height: 14, color: 'var(--muted)', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: phase1 ? 'var(--text-2)' : 'var(--muted)' }}>{label}</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              {phase1
                ? <Check style={{ width: 14, height: 14, color: 'var(--muted)', display: 'inline-block' }} />
                : <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.15)' }}>—</span>}
            </div>
            <div style={{ textAlign: 'center' }}>
              {phase2
                ? <Check style={{ width: 14, height: 14, color: 'var(--yellow)', display: 'inline-block' }} />
                : <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.15)' }}>—</span>}
            </div>
          </div>
        ))}
      </div>

      {/* FAQ teaser */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--muted)' }}>
          ¿Preguntas? Escríbenos por WhatsApp
        </p>
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(245,197,0,0.5)', fontWeight: 600 }}>
          soporte@barber-loyalty.com
        </p>
      </div>
    </div>
  )
}
