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

  return (
    <div style={{ background: 'linear-gradient(135deg,#1a1a1a,#222)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 16, padding: 20, position: 'relative', overflow: 'hidden' }}>
      {/* subtle glow */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>{nombre}</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>DNI/CE: {dniCe}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)' }}>Tarjeta #{tarjetasCompletas + 1}</p>
          <p style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 900, color: 'var(--gold)' }}>
            {visitasActuales}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)' }}>/10</span>
          </p>
        </div>
      </div>

      {/* Stamps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 14 }}>
        {stamps.map((filled, i) => (
          <div key={i} style={{
            aspectRatio: '1',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: filled
              ? 'linear-gradient(135deg,#A07830,#C9A84C,#E8C87A)'
              : 'rgba(255,255,255,0.03)',
            border: filled ? 'none' : '1px dashed rgba(201,168,76,0.2)',
            boxShadow: filled ? '0 0 10px rgba(201,168,76,0.35)' : 'none',
            transition: 'all 0.3s',
          }}>
            {filled
              ? <Scissors className="w-4 h-4" style={{ color: '#111' }} />
              : <span style={{ fontSize: 18, color: 'rgba(201,168,76,0.15)' }}>○</span>
            }
          </div>
        ))}
      </div>

      {/* Prize info */}
      {premioPendiente && premioTexto ? (
        <div style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trophy className="w-4 h-4" style={{ color: 'var(--gold)', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 13, color: 'var(--gold)', fontWeight: 700 }}>
            🎉 Premio pendiente: {premioTexto}
          </p>
        </div>
      ) : nextPremio ? (
        <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
          🎁 Al completar: <strong style={{ color: 'var(--text)' }}>{nextPremio}</strong>
        </p>
      ) : null}
    </div>
  )
}
