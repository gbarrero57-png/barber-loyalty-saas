'use client'

import { useActionState, useState } from 'react'
import { updateAppointment } from '@/lib/actions/appointments'
import { Pencil, X } from 'lucide-react'

interface Props {
  cita: {
    id: string
    fecha_inicio: string
    duracion_min?: number
    barber_id: string | null
    service_id: string | null
    notas: string | null
  }
  activeBarbers: { id: string; nombre: string }[]
  activeServices: { id: string; nombre: string; precio: number }[]
}

const initialState: { error?: string } = {}

export default function EditarCitaForm({ cita, activeBarbers, activeServices }: Props) {
  const [open, setOpen] = useState(false)

  const action = updateAppointment.bind(null, cita.id)
  const [state, formAction, pending] = useActionState(action, initialState)

  const fechaLocal = new Date(cita.fecha_inicio)
  const fechaISO = new Date(fechaLocal.getTime() - fechaLocal.getTimezoneOffset() * 60000)
    .toISOString().slice(0, 16)
  const durMin = cita.duracion_min ?? 30

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'none', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 7, padding: '5px 9px', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 11, color: 'var(--muted)',
        }}
      >
        <Pencil style={{ width: 11, height: 11 }} /> Editar
      </button>
    )
  }

  return (
    <div style={{
      marginTop: 10, padding: 14, borderRadius: 12,
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--yellow)' }}>Reagendar cita</span>
        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 2 }}>
          <X style={{ width: 14, height: 14 }} />
        </button>
      </div>

      <form action={formAction} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <label className="input-label">Fecha y hora</label>
          <input name="fecha_inicio" type="datetime-local" required defaultValue={fechaISO} />
        </div>
        <div>
          <label className="input-label">Duración (min)</label>
          <input name="duracion_min" type="number" min="5" step="5" defaultValue={durMin} />
        </div>
        <div>
          <label className="input-label">Barbero</label>
          <select name="barber_id" defaultValue={cita.barber_id ?? ''}>
            <option value="">Sin asignar</option>
            {activeBarbers.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="input-label">Servicio</label>
          <select name="service_id" defaultValue={cita.service_id ?? ''}>
            <option value="">Sin servicio</option>
            {activeServices.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="input-label">Notas</label>
          <input name="notas" defaultValue={cita.notas ?? ''} placeholder="Observaciones (opcional)" />
        </div>

        {state?.error && (
          <div style={{
            gridColumn: '1 / -1', color: '#f87171', fontSize: 12,
            padding: '7px 10px', background: 'rgba(248,113,113,0.08)',
            borderRadius: 7, border: '1px solid rgba(248,113,113,0.2)',
          }}>
            {state.error}
          </div>
        )}

        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => setOpen(false)} style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: 8,
            padding: '7px 14px', fontSize: 12, color: 'var(--muted)', cursor: 'pointer',
          }}>
            Cancelar
          </button>
          <button type="submit" className="btn-add" disabled={pending} style={{ padding: '7px 16px', fontSize: 12 }}>
            {pending ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
