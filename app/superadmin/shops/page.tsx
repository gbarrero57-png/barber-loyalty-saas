import { getAllShops } from '@/lib/actions/superadmin'
import Link from 'next/link'
import { ChevronRight, Clock, CheckCircle, PauseCircle, XCircle } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: any }> = {
  trial:     { label: 'Trial',    color: '#fbbf24', Icon: Clock },
  active:    { label: 'Activa',   color: '#34d399', Icon: CheckCircle },
  paused:    { label: 'Pausada',  color: '#f87171', Icon: PauseCircle },
  cancelled: { label: 'Cancelada',color: '#6b7280', Icon: XCircle },
}

export default async function ShopsPage() {
  const shops = await getAllShops()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Barberías</h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>{shops.length} registradas</p>
        </div>
      </div>

      <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 14, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 12, padding: '10px 18px', borderBottom: '1px solid #1f1f1f' }}>
          {['Barbería', 'Plan', 'Estado', ''].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
          ))}
        </div>

        {shops.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
            No hay barberías registradas aún
          </div>
        )}

        {shops.map((shop: any) => {
          const sub = Array.isArray(shop.subscriptions) ? shop.subscriptions[0] : shop.subscriptions
          const status = sub?.status ?? 'trial'
          const plan = sub?.plan ?? 'phase1'
          const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.trial
          const { Icon } = cfg

          const trialEnd = new Date(sub?.trial_ends_at ?? shop.trial_ends_at)
          const trialDays = Math.ceil((trialEnd.getTime() - Date.now()) / 86400000)

          return (
            <Link key={shop.id} href={`/superadmin/shops/${shop.id}`}
              style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 12, alignItems: 'center', padding: '13px 18px', borderBottom: '1px solid #161616', textDecoration: 'none', color: 'inherit', transition: 'background 0.15s' }}>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{shop.nombre}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>
                  {shop.email_admin}
                  {status === 'trial' && trialDays > 0 && (
                    <span style={{ marginLeft: 6, color: '#fbbf24' }}>· {trialDays}d trial</span>
                  )}
                  {status === 'trial' && trialDays <= 0 && (
                    <span style={{ marginLeft: 6, color: '#f87171' }}>· Trial vencido</span>
                  )}
                </p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: plan === 'phase2' ? 'rgba(129,140,248,0.15)' : 'rgba(201,168,76,0.1)', color: plan === 'phase2' ? '#818cf8' : '#C9A84C', whiteSpace: 'nowrap' }}>
                {plan === 'phase2' ? '💈 Pro' : '✂️ Loyalty'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: `${cfg.color}18`, color: cfg.color, whiteSpace: 'nowrap' }}>
                <Icon className="w-3 h-3" />
                {cfg.label}
              </span>
              <ChevronRight className="w-4 h-4" style={{ color: '#374151' }} />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
