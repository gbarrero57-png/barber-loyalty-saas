import { notFound } from 'next/navigation'
import { getClientWithCard } from '@/lib/actions/clients'
import StampCard from '@/components/StampCard'
import ClientActions from './ClientActions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getClientWithCard(id)
  if (!data) notFound()

  const { card, nextPremio, ...client } = data

  return (
    <div>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 13, textDecoration: 'none', marginBottom: 16 }}>
        <ArrowLeft className="w-4 h-4" /> Volver
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

      <div style={{ marginTop: 16 }}>
        <ClientActions
          clientId={client.id}
          premioPendiente={card.premio_pendiente}
          visitasActuales={card.visitas_actuales}
        />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <p className="label" style={{ marginBottom: 8 }}>Datos del cliente</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--muted)' }}>Email</span>
            <span>{client.email}</span>
          </div>
          {client.telefono && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Teléfono</span>
              <span>{client.telefono}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--muted)' }}>Cliente desde</span>
            <span>{new Date(client.created_at).toLocaleDateString('es-PE')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--muted)' }}>Tarjetas completas</span>
            <span style={{ fontWeight: 700, color: 'var(--gold)' }}>{card.tarjetas_completas}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
