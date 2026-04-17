import { getClientPayments, getPaymentStats } from '@/lib/actions/clientpayments'
import { getMyShop } from '@/lib/actions/shop'
import { CreditCard, TrendingUp } from 'lucide-react'
import UpgradeGate from '@/components/UpgradeGate'

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export const dynamic = 'force-dynamic'

export default async function PagosPage() {
  const shop = await getMyShop()
  const isPhase2 = shop?.subscription_plan === 'phase2'

  if (!isPhase2) {
    return (
      <div>
        <h1 className="page-title">Cobros en línea</h1>
        <p className="page-subtitle" style={{ marginBottom: 24 }}>Genera links de pago para tus clientes</p>
        <UpgradeGate
          feature="Cobros en Línea"
          description="Genera links de pago en segundos y compártelos por WhatsApp. Tu cliente paga con tarjeta desde su teléfono."
          icon={CreditCard}
          bullets={[
            'Link de pago por cita (Stripe)',
            'El cliente paga desde su teléfono',
            'Historial de cobros en tiempo real',
            'Confirmación automática al cliente',
            'Compatible con todas las tarjetas',
          ]}
          hint="Integrado directamente en la Agenda"
        />
      </div>
    )
  }

  const [payments, stats] = await Promise.all([
    getClientPayments(),
    getPaymentStats(),
  ])

  return (
    <div>
      <h1 className="page-title">Cobros en línea</h1>
      <p className="page-subtitle">Pagos recibidos de clientes vía Stripe</p>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
        {[
          { label: 'Hoy',      value: `S/ ${stats.totalHoy.toFixed(2)}`,  color: '#34d399' },
          { label: 'Este mes', value: `S/ ${stats.totalMes.toFixed(2)}`,  color: 'var(--yellow)' },
          { label: 'Pagos',    value: String(stats.totalPagos),           color: '#818cf8' },
        ].map(({ label, value, color }) => (
          <div key={label} className="kpi-card" style={{ textAlign: 'center', padding: '14px 8px' }}>
            <p className="kpi-value" style={{ color, fontSize: 20 }}>{value}</p>
            <p className="kpi-sub" style={{ textAlign: 'center' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Instrucciones */}
      <div className="section-card" style={{ marginBottom: 18 }}>
        <p className="section-title"><CreditCard className="w-3.5 h-3.5" /> Cómo cobrar</p>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--muted)', lineHeight: 2 }}>
          <li>Ve a <strong style={{ color: 'var(--text)' }}>Agenda → cita del cliente</strong></li>
          <li>Toca <strong style={{ color: 'var(--yellow)' }}>Cobrar</strong> — se genera el link</li>
          <li>Comparte el link por WhatsApp</li>
          <li>El cliente paga con tarjeta vía Stripe</li>
        </ol>
      </div>

      {/* Historial */}
      {payments.length === 0 ? (
        <div className="empty-state">
          <TrendingUp className="w-10 h-10" style={{ margin: '0 auto', opacity: 0.2 }} />
          <p>Sin cobros registrados aún</p>
        </div>
      ) : (
        <div className="list-table">
          <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)' }}>
            <span className="label" style={{ margin: 0 }}>Historial — {payments.length} cobros</span>
          </div>
          {payments.map((p: any) => {
            const appt = p.appointments
            return (
              <div key={p.id} className="list-table-row" style={{ gridTemplateColumns: '1fr auto', gap: 10 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>{appt?.client_nombre ?? p.email ?? '—'}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--muted)' }}>
                    {appt?.services?.nombre ?? p.concepto} · {formatFecha(p.created_at)}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#4ade80', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
                    +S/ {Number(p.monto).toFixed(2)}
                  </span>
                  <span className={`badge ${p.estado === 'pagado' ? 'badge-active' : 'badge-pending'}`}>{p.estado}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
