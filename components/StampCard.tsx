'use client'

import { Scissors, Trophy } from 'lucide-react'

interface Props {
  nombre: string
  dniCe: string
  visitasActuales: number
  tarjetasCompletas: number
  premioPendiente: boolean
  premioTexto: string | null
  nextPremio: string | null
}

export default function StampCard({
  nombre, dniCe, visitasActuales, tarjetasCompletas,
  premioPendiente, premioTexto, nextPremio
}: Props) {
  const stamps = Array.from({ length: 10 }, (_, i) => i < visitasActuales)
  const progress = Math.round((visitasActuales / 10) * 100)

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        background: 'linear-gradient(145deg, #0F0F0F 0%, #171717 50%, #0C0C0C 100%)',
        border: '1px solid rgba(245,197,0,0.18)',
        borderRadius: 22,
        padding: '22px 20px 18px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(245,197,0,0.07)',
      }}>
        {/* Diagonal lines texture */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 36px, rgba(245,197,0,0.015) 36px, rgba(245,197,0,0.015) 37px)',
        }} />

        {/* Ambient glow top-right */}
        <div style={{
          position: 'absolute', top: -50, right: -50,
          width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,197,0,0.1) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Header row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: 20, position: 'relative', zIndex: 1,
        }}>
          <div>
            <p style={{
              margin: '0 0 4px',
              fontSize: 9.5, fontWeight: 700, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'rgba(245,197,0,0.5)',
              fontFamily: 'var(--sans)',
            }}>
              Miembro
            </p>
            <p style={{
              margin: 0, fontWeight: 700, fontSize: 17,
              color: 'var(--text)', letterSpacing: '-0.01em',
              fontFamily: 'var(--serif)', lineHeight: 1.15,
            }}>
              {nombre}
            </p>
            <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.05em' }}>
              {dniCe}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{
              margin: '0 0 4px', fontSize: 9.5, fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'rgba(245,197,0,0.5)', fontFamily: 'var(--sans)',
            }}>
              {tarjetasCompletas > 0 ? `Tarjeta #${tarjetasCompletas + 1}` : 'Sellos'}
            </p>
            <p style={{
              margin: 0, fontSize: 28, fontWeight: 900,
              color: 'var(--yellow)', lineHeight: 1,
              fontFamily: 'var(--serif)', fontStyle: 'italic',
            }}>
              {visitasActuales}
              <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(245,197,0,0.4)', fontStyle: 'normal' }}>
                /10
              </span>
            </p>
          </div>
        </div>

        {/* Stamp grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8,
          marginBottom: 16, position: 'relative', zIndex: 1,
        }}>
          {stamps.map((filled, i) => (
            <div
              key={i}
              className={filled ? 'anim-gold-glow' : ''}
              style={{
                aspectRatio: '1',
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: filled ? 'var(--yellow)' : 'rgba(255,255,255,0.03)',
                border: filled ? 'none' : '1.5px dashed rgba(245,197,0,0.12)',
                boxShadow: filled ? '0 2px 12px rgba(245,197,0,0.25)' : 'none',
                animationDelay: filled ? `${i * 0.25}s` : undefined,
                transition: 'transform 0.2s',
              }}
            >
              {filled
                ? <Scissors
                    style={{ width: 14, height: 14, color: '#000' }}
                  />
                : <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    display: 'block', background: 'rgba(245,197,0,0.1)',
                  }} />
              }
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{
          height: 3, background: 'rgba(255,255,255,0.04)',
          borderRadius: 3, marginBottom: 16, overflow: 'hidden',
          position: 'relative', zIndex: 1,
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'var(--yellow)',
            borderRadius: 3,
            transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: '0 0 8px rgba(245,197,0,0.4)',
          }} />
        </div>

        {/* Prize / next reward */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {premioPendiente && premioTexto ? (
            <div style={{
              background: 'rgba(245,197,0,0.08)',
              border: '1px solid rgba(245,197,0,0.2)',
              borderRadius: 12,
              padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Trophy style={{ width: 16, height: 16, color: 'var(--yellow)', flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: 13, color: 'var(--yellow)', fontWeight: 700 }}>
                Premio disponible: {premioTexto}
              </p>
            </div>
          ) : nextPremio ? (
            <p style={{
              margin: 0, fontSize: 11, color: 'var(--muted)',
              textAlign: 'center', letterSpacing: '0.04em',
            }}>
              Al completar la tarjeta
              {' · '}
              <strong style={{ color: 'var(--text-2)', fontWeight: 600 }}>
                {nextPremio}
              </strong>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
