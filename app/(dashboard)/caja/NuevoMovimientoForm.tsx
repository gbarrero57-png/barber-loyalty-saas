'use client'

import { useActionState } from 'react'
import { registerMovement } from '@/lib/actions/caja'
import { DollarSign } from 'lucide-react'

const CATEGORIAS_INGRESO = ['Corte', 'Barba', 'Combo corte+barba', 'Tinte', 'Tratamiento', 'Otro ingreso']
const CATEGORIAS_EGRESO  = ['Insumos', 'Alquiler', 'Servicios', 'Sueldo', 'Publicidad', 'Otro egreso']

interface Props {
  activeBarbers: { id: string; nombre: string }[]
}

const initialState: { error?: string } = {}

export default function NuevoMovimientoForm({ activeBarbers }: Props) {
  const [state, action, pending] = useActionState(registerMovement, initialState)

  return (
    <div className="section-card">
      <p className="section-title"><DollarSign className="w-3.5 h-3.5" /> Registrar movimiento</p>
      <form action={action} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label className="input-label">Tipo *</label>
          <select name="tipo" required>
            <option value="ingreso">💰 Ingreso</option>
            <option value="egreso">📤 Egreso</option>
          </select>
        </div>
        <div>
          <label className="input-label">Categoría *</label>
          <select name="categoria" required>
            <optgroup label="Ingresos">{CATEGORIAS_INGRESO.map(c => <option key={c} value={c}>{c}</option>)}</optgroup>
            <optgroup label="Egresos">{CATEGORIAS_EGRESO.map(c => <option key={c} value={c}>{c}</option>)}</optgroup>
          </select>
        </div>
        <div>
          <label className="input-label">Monto (S/) *</label>
          <input name="monto" type="number" step="0.50" min="0.01" required placeholder="25.00" />
        </div>
        <div>
          <label className="input-label">Método de pago</label>
          <select name="metodo_pago">
            <option value="efectivo">Efectivo</option>
            <option value="yape">Yape</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
          </select>
        </div>
        {activeBarbers.length > 0 && (
          <div>
            <label className="input-label">Barbero</label>
            <select name="barber_id">
              <option value="">Todos</option>
              {activeBarbers.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
            </select>
          </div>
        )}
        <div style={{ gridColumn: activeBarbers.length > 0 ? '2/-1' : '1/-1' }}>
          <label className="input-label">Descripción</label>
          <input name="descripcion" placeholder="Detalle adicional (opcional)" />
        </div>

        {state?.error && (
          <div style={{
            gridColumn: '1/-1',
            color: '#f87171', fontSize: 13,
            padding: '8px 12px', background: 'rgba(248,113,113,0.08)',
            borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)',
          }}>
            {state.error}
          </div>
        )}

        <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-add" disabled={pending}>
            {pending ? 'Registrando…' : 'Registrar'}
          </button>
        </div>
      </form>
    </div>
  )
}
