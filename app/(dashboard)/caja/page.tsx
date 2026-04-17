import { getCajaMovements, getCajaStats, registerMovement, deleteMovement } from '@/lib/actions/caja'
import { getBarbers } from '@/lib/actions/barbers'
import { getMyShop } from '@/lib/actions/shop'
import { TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react'
import UpgradeGate from '@/components/UpgradeGate'

const CATEGORIAS_INGRESO = ['Corte', 'Barba', 'Combo corte+barba', 'Tinte', 'Tratamiento', 'Otro ingreso']
const CATEGORIAS_EGRESO  = ['Insumos', 'Alquiler', 'Servicios', 'Sueldo', 'Publicidad', 'Otro egreso']

function fmt(n: number) { return `S/ ${n.toFixed(2)}` }
function fmtFecha(iso: string) {
  return new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export const dynamic = 'force-dynamic'

export default async function CajaPage() {
  const shop = await getMyShop()
  const isPhase2 = shop?.subscription_plan === 'phase2'

  if (!isPhase2) {
    return (
      <div>
        <h1 className="page-title">Caja</h1>
        <p className="page-subtitle" style={{ marginBottom: 24 }}>Control de ingresos y egresos</p>
        <UpgradeGate
          feature="Caja y Finanzas"
          description="Lleva el control exacto de ingresos, egresos y balance de tu barbería. Sabe cuánto ganas cada día y cada mes."
          icon={Wallet}
          bullets={[
            'Registra ingresos por servicio',
            'Controla egresos (insumos, alquiler, sueldos)',
            'Balance diario y mensual',
            'Por barbero: quién generó qué',
            'Reportes visuales del negocio',
          ]}
        />
      </div>
    )
  }

  const [movements, stats, barbers] = await Promise.all([
    getCajaMovements(), getCajaStats(), getBarbers(),
  ])
  const activeBarbers = barbers.filter((b: any) => b.activo)
  const ingresos = movements.filter((m: any) => m.tipo === 'ingreso')
  const egresos  = movements.filter((m: any) => m.tipo === 'egreso')

  return (
    <div>
      <h1 className="page-title">Caja</h1>
      <p className="page-subtitle">Ingresos y egresos del mes actual</p>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
        <div className="kpi-card" style={{ borderColor: 'rgba(52,211,153,0.15)' }}>
          <div className="kpi-label" style={{ color: '#34d399' }}>
            <TrendingUp className="w-3.5 h-3.5" /> Ingresos
          </div>
          <p className="kpi-value" style={{ color: '#34d399' }}>{fmt(stats.ingresosMes)}</p>
          <p className="kpi-sub">Hoy: {fmt(stats.ingresosHoy)}</p>
        </div>
        <div className="kpi-card" style={{ borderColor: 'rgba(248,113,113,0.15)' }}>
          <div className="kpi-label" style={{ color: '#f87171' }}>
            <TrendingDown className="w-3.5 h-3.5" /> Egresos
          </div>
          <p className="kpi-value" style={{ color: '#f87171' }}>{fmt(stats.egresosMes)}</p>
          <p className="kpi-sub">&nbsp;</p>
        </div>
        <div className="kpi-card" style={{
          gridColumn: '1/-1',
          borderColor: stats.balanceMes >= 0 ? 'rgba(245,197,0,0.2)' : 'rgba(248,113,113,0.2)',
          background: stats.balanceMes >= 0
            ? 'linear-gradient(135deg, rgba(245,197,0,0.08), rgba(245,197,0,0.04))'
            : 'linear-gradient(135deg, rgba(120,20,20,0.2), rgba(60,10,10,0.1))',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div className="kpi-label" style={{ color: stats.balanceMes >= 0 ? 'var(--yellow)' : '#f87171' }}>
              <Wallet className="w-3.5 h-3.5" /> Balance del mes
            </div>
            <p className="kpi-value" style={{ color: stats.balanceMes >= 0 ? 'var(--yellow)' : '#f87171', fontSize: 30 }}>
              {fmt(stats.balanceMes)}
            </p>
          </div>
          <span style={{ fontSize: 32, opacity: 0.25 }}>{stats.balanceMes >= 0 ? '↑' : '↓'}</span>
        </div>
      </div>

      {/* Formulario */}
      <div className="section-card">
        <p className="section-title"><DollarSign className="w-3.5 h-3.5" /> Registrar movimiento</p>
        <form action={registerMovement} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
                {activeBarbers.map((b: any) => <option key={b.id} value={b.id}>{b.nombre}</option>)}
              </select>
            </div>
          )}
          <div style={{ gridColumn: activeBarbers.length > 0 ? '2/-1' : '1/-1' }}>
            <label className="input-label">Descripción</label>
            <input name="descripcion" placeholder="Detalle adicional (opcional)" />
          </div>
          <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-add">Registrar</button>
          </div>
        </form>
      </div>

      {/* Historial */}
      {movements.length === 0 ? (
        <div className="empty-state">
          <DollarSign className="w-10 h-10" style={{ margin: '0 auto', opacity: 0.2 }} />
          <p>No hay movimientos este mes</p>
        </div>
      ) : (
        <div className="list-table">
          <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="label" style={{ margin: 0 }}>Movimientos — {movements.length}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              <span style={{ color: '#34d399', marginRight: 12 }}>↑ {fmt(ingresos.reduce((s: number, m: any) => s + Number(m.monto), 0))}</span>
              <span style={{ color: '#f87171' }}>↓ {fmt(egresos.reduce((s: number, m: any) => s + Number(m.monto), 0))}</span>
            </span>
          </div>
          {movements.map((m: any) => (
            <div key={m.id} className="list-table-row" style={{ gridTemplateColumns: '1fr auto', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' }}>
                  <span className={`badge ${m.tipo === 'ingreso' ? 'badge-active' : 'badge-inactive'}`}>
                    {m.tipo === 'ingreso' ? '↑' : '↓'} {m.categoria}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{m.metodo_pago}</span>
                  {m.barbers && <span style={{ fontSize: 11, color: '#818cf8' }}>· {m.barbers.nombre}</span>}
                </div>
                {m.descripcion && <p style={{ margin: '0 0 2px', fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.descripcion}</p>}
                <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)', opacity: 0.6 }}>{fmtFecha(m.fecha)}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 800, fontFamily: 'var(--serif)', fontStyle: 'italic', color: m.tipo === 'ingreso' ? '#4ade80' : '#f87171' }}>
                  {m.tipo === 'ingreso' ? '+' : '−'}{fmt(Number(m.monto))}
                </span>
                <form action={deleteMovement.bind(null, m.id)}>
                  <button type="submit" className="btn-sm btn-sm-muted"
                    onClick={(e) => { if (!confirm('¿Eliminar registro?')) e.preventDefault() }}
                    style={{ padding: '4px 8px' }}>✕</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
