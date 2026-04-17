'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UserPlus, Scissors, TrendingUp, Trophy, Star, Calendar, Zap, MessageCircle } from 'lucide-react'
import ClientSearch from '@/components/ClientSearch'

function useCountUp(target: number, duration = 900, delay = 0) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target === 0) return
    const timeout = setTimeout(() => {
      const start = performance.now()
      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setValue(Math.round(target * eased))
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, delay)
    return () => clearTimeout(timeout)
  }, [target, duration, delay])
  return value
}

interface Props {
  totalClients: number
  visitasHoy: number
  premiosPendientes: number
  isPhase2: boolean
}

export default function HomeUI({ totalClients, visitasHoy, premiosPendientes, isPhase2 }: Props) {
  const clients = useCountUp(totalClients, 800, 300)
  const hoy     = useCountUp(visitasHoy,   700, 450)
  const premios = useCountUp(premiosPendientes, 600, 600)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── HERO action card — glass sobre fondo ── */}
      <div
        className="anim-scale-in"
        style={{
          borderRadius: 24, overflow: 'hidden', position: 'relative',
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          border: '1.5px solid rgba(245,197,0,0.2)',
          padding: '24px 20px 22px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}
      >
        {/* shimmer */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: 0, bottom: 0, width: '60%',
            background: 'linear-gradient(90deg, transparent, rgba(245,197,0,0.06), transparent)',
            animation: 'shimmerSweep 4s ease-in-out infinite',
            animationDelay: '1.5s',
          }} />
        </div>
        {/* yellow left bar */}
        <div style={{
          position: 'absolute', left: 0, top: 18, bottom: 18,
          width: 4, borderRadius: '0 4px 4px 0', background: 'var(--yellow)',
          animation: 'slideBarIn 0.5s ease-out 0.3s both',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'rgba(245,197,0,0.15)',
            border: '1px solid rgba(245,197,0,0.3)',
            borderRadius: 999, padding: '3px 10px',
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
            color: 'var(--yellow)', textTransform: 'uppercase',
            width: 'fit-content', marginBottom: 10,
          }}>
            <Star style={{ width: 9, height: 9 }} /> Loyalty Pro
          </span>
          <h2 style={{
            margin: '0 0 4px', fontWeight: 900, fontSize: 20,
            color: '#fff', fontFamily: 'var(--serif)', letterSpacing: '-0.02em',
          }}>
            Registrar Visita
          </h2>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            Busca al cliente por DNI, CE o nombre
          </p>
        </div>

        <div className="anim-float" style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
          <div style={{
            width: 50, height: 50, borderRadius: 15, background: 'var(--yellow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(245,197,0,0.45)',
          }}>
            <Scissors style={{ width: 22, height: 22, color: '#000' }} />
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { label: 'Clientes',  value: clients, color: 'var(--yellow)',  border: 'rgba(245,197,0,0.2)',  icon: '👥' },
          { label: 'Hoy',       value: hoy,      color: '#34d399',       border: 'rgba(52,211,153,0.2)', icon: '✂️' },
          { label: 'Premios',   value: premios,  color: '#f59e0b',       border: 'rgba(245,158,11,0.2)', icon: '🏆' },
        ].map(({ label, value, color, border, icon }, i) => (
          <div
            key={label}
            className="kpi-card anim-fade-up"
            style={{
              textAlign: 'center', padding: '16px 8px',
              borderColor: border,
              animationDelay: `${0.1 + i * 0.08}s`,
            }}
          >
            <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
            <p className="kpi-value anim-number" style={{ fontSize: 26, color, animationDelay: `${0.4 + i * 0.1}s` }}>
              {value}
            </p>
            <p className="kpi-sub" style={{ textAlign: 'center', marginTop: 3 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="anim-fade-up" style={{ animationDelay: '0.25s' }}>
        <ClientSearch />
      </div>

      {/* ── Quick actions ── */}
      <div className="anim-fade-up" style={{ animationDelay: '0.32s' }}>
        <p style={{
          margin: '0 0 10px', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)',
        }}>
          Acciones rápidas
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { href: '/clientes/nuevo', icon: UserPlus,    label: 'Nuevo cliente', sub: 'Registrar',    color: 'var(--yellow)',  bg: 'rgba(245,197,0,0.07)',  border: 'rgba(245,197,0,0.15)' },
            { href: '/caja',           icon: TrendingUp,  label: 'Caja',          sub: 'Ingresos',     color: '#34d399',        bg: 'rgba(52,211,153,0.07)', border: 'rgba(52,211,153,0.15)' },
            { href: '/citas',          icon: Calendar,    label: 'Agenda',        sub: 'Ver citas',    color: '#818cf8',        bg: 'rgba(129,140,248,0.07)',border: 'rgba(129,140,248,0.15)' },
            { href: '/clientes',       icon: Trophy,      label: 'Clientes',      sub: 'Ver lista',    color: '#f59e0b',        bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.15)' },
          ].map(({ href, icon: Icon, label, sub, color, bg, border }) => (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: bg,
                border: `1.5px solid ${border}`,
                borderRadius: 18,
                padding: '18px 14px',
                display: 'flex', flexDirection: 'column', gap: 10,
                transition: 'transform 0.15s, border-color 0.2s',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon style={{ width: 18, height: 18, color: '#000' }} />
                </div>
                <div>
                  <p style={{ margin: '0 0 2px', fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)' }}>{sub}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Prizes alert ── */}
      {premiosPendientes > 0 && (
        <Link href="/clientes" style={{ textDecoration: 'none' }} className="anim-fade-up">
          <div style={{
            background: 'linear-gradient(135deg, rgba(245,197,0,0.1), rgba(245,197,0,0.05))',
            border: '1.5px solid rgba(245,197,0,0.25)',
            borderRadius: 18,
            padding: '16px 18px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: 'var(--yellow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Trophy style={{ width: 18, height: 18, color: '#000' }} />
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>
                {premiosPendientes} premio{premiosPendientes > 1 ? 's' : ''} pendiente{premiosPendientes > 1 ? 's' : ''}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
                Clientes esperando su recompensa →
              </p>
            </div>
          </div>
        </Link>
      )}

      {/* ── FOMO upgrade banner (Phase 1 only) ── */}
      {!isPhase2 && (
        <Link href="/upgrade" style={{ textDecoration: 'none' }} className="anim-fade-up">
          <div style={{
            borderRadius: 20, padding: '18px 18px',
            background: 'linear-gradient(135deg, rgba(20,16,5,0.92) 0%, rgba(35,26,5,0.92) 100%)',
            border: '1.5px solid rgba(245,197,0,0.35)',
            display: 'flex', alignItems: 'center', gap: 14,
            position: 'relative', overflow: 'hidden',
          }}>
            {/* shimmer */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
              <div style={{
                position: 'absolute', top: 0, bottom: 0, width: '55%',
                background: 'linear-gradient(90deg, transparent, rgba(245,197,0,0.07), transparent)',
                animation: 'shimmerSweep 3.5s ease-in-out infinite',
                animationDelay: '0.8s',
              }} />
            </div>
            <div style={{
              width: 44, height: 44, borderRadius: 13, flexShrink: 0,
              background: 'linear-gradient(135deg, #F5C500, #e6a800)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 18px rgba(245,197,0,0.35)',
              position: 'relative', zIndex: 1,
            }}>
              <MessageCircle style={{ width: 20, height: 20, color: '#000' }} />
            </div>
            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <p style={{ margin: 0, fontWeight: 900, fontSize: 14, color: '#fff' }}>
                  Bot WA · Agenda · Caja
                </p>
                <Zap style={{ width: 13, height: 13, color: 'var(--yellow)', flexShrink: 0 }} />
              </div>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                Activa Barber Pro desde S/79/mes →
              </p>
            </div>
          </div>
        </Link>
      )}

    </div>
  )
}
