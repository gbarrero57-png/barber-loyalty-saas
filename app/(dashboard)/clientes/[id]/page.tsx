import { notFound } from 'next/navigation'
import { getClientWithCard, getVisitHistory } from '@/lib/actions/clients'
import StampCard from '@/components/StampCard'
import ClientActions from './ClientActions'
import Link from 'next/link'
import { ArrowLeft, Scissors, Trophy } from 'lucide-react'

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [data, visits] = await Promise.all([
    getClientWithCard(id),
    getVisitHistory(id),
  ])
  if (!data) notFound()

  const { card, nextPremio, ...client } = data
  const totalVisitas = (card.tarjetas_completas * 10) + card.visitas_actuales

  return (
    <div>
      <Link href="/" className="link-back" style={{ marginBottom: 18, display: 'inline-flex' }}>
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver
      </Link>

      <StampCard
        nombre={client.nombre}
        dniCe={client.dni_ce}
        visitasActuales={card.visitas_actuales}
        tarjetasCompletas={card.tarjetas_completas}
        premioPendiente={card.premio_pendiente}
        premioTexto={card.premio_texto}
        nextPremio={nextPremio}
      />

      <div style={{ marginTop: 14 }}>
        <ClientActions
          clientId={client.id}
          premioPendiente={card.premio_pendiente}
          visitasActuales={card.visitas_actuales}
        />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
        {[
          { label: 'Visitas', value: totalVisitas },
          { label: 'Tarjetas', value: card.tarjetas_completas },
          { label: 'Desde', value: new Date(client.created_at).toLocaleDateString('es-PE', { month: 'short', year: '2-digit' }) },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '14px 8px', textAlign: 'center',
          }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: 'var(--gold)', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
              {value}
            </p>
            <p style={{ margin: '3px 0 0', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Datos */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, marginTop: 10 }}>
        <p className="label" style={{ marginBottom: 12 }}>Información</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>Email</span>
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{client.email}</span>
          </div>
          {client.telefono && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>Teléfono</span>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{client.telefono}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>DNI / CE</span>
            <span style={{ fontSize: 13, color: 'var(--text-2)', letterSpacing: '0.05em' }}>{client.dni_ce}</span>
          </div>
        </div>
      </div>

      {/* Historial */}
      {visits.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, marginTop: 10 }}>
          <p className="label" style={{ marginBottom: 12 }}>Historial</p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {visits.map((v, i) => (
              <div key={v.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0',
                borderBottom: i < visits.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: v.premio_aplicado ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${v.premio_aplicado ? 'rgba(201,168,76,0.25)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                  {v.premio_aplicado
                    ? <Trophy className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                    : <Scissors className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: v.premio_aplicado ? 'var(--gold)' : 'var(--text-2)' }}>
                    {v.premio_aplicado ? `Premio: ${v.premio_aplicado}` : 'Visita registrada'}
                  </p>
                  <p style={{ margin: '1px 0 0', fontSize: 11, color: 'var(--muted)' }}>
                    {new Date(v.fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
