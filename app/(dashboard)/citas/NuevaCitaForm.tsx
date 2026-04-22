'use client'

import { useActionState } from 'react'
import { createAppointment } from '@/lib/actions/appointments'
import { CalendarDays } from 'lucide-react'

interface Props {
  activeBarbers: { id: string; nombre: string }[]
  activeServices: { id: string; nombre: string; precio: number }[]
  nowISO: string
}

const initialState: { error?: string } = {}

export default function NuevaCitaForm({ activeBarbers, activeServices, nowISO }: Props) {
  const [state, action, pending] = useActionState(createAppointment, initialState)

  return (
    <div className="section-card">
      <p className="section-title">
        <CalendarDays className="w-3.5 h-3.5" /> Nueva cita
      </p>
      <form action={action} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        <div>
          <label className="input-label">Cliente *</label>
          <input name="client_nombre" required placeholder="Nombre del cliente" />
        </div>
        <div>
          <label className="input-label">Teléfono</label>
          <input name="client_tel" placeholder="987654321" />
        </div>
        <div>
          <label className="input-label">Fecha y hora *</label>
          <input name="fecha_inicio" type="datetime-local" required min={nowISO} />
        </div>
        <div>
          <label className="input-label">Barbero</label>
          <select name="barber_id">
            <option value="">Sin asignar</option>
            {activeBarbers.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="input-label">Servicio</label>
          <select name="service_id">
            <option value="">Sin servicio</option>
            {activeServices.map(s => <option key={s.id} value={s.id}>{s.nombre} — S/{Number(s.precio).toFixed(2)}</option>)}
          </select>
        </div>
        <div>
          <label className="input-label">Duración (min)</label>
          <input name="duracion_min" type="number" min="5" step="5" defaultValue={30} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="input-label">Notas</label>
          <input name="notas" placeholder="Observaciones (opcional)" />
        </div>

        {state?.error && (
          <div style={{
            gridColumn: '1 / -1',
            color: '#f87171', fontSize: 13,
            padding: '8px 12px', background: 'rgba(248,113,113,0.08)',
            borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)',
          }}>
            {state.error}
          </div>
        )}

        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-add" disabled={pending}>
            {pending ? 'Agendando…' : 'Agendar cita'}
          </button>
        </div>
      </form>
    </div>
  )
}
