import { getAdminStats, getAllShops } from '@/lib/actions/superadmin'
import Link from 'next/link'
import { Store, TrendingUp, Clock, PauseCircle, PlusCircle } from 'lucide-react'

export default async function SuperAdminDashboard() {
  const [stats, shops] = await Promise.all([getAdminStats(), getAllShops()])

  const recentShops = shops.slice(0, 5)

  const kpis = [
    { label: 'Total barberías', value: stats.totalShops, icon: Store, color: '#818cf8' },
    { label: 'Activas', value: stats.activeShops, icon: TrendingUp, color: '#34d399' },
    { label: 'En trial', value: stats.trialShops, icon: Clock, color: '#fbbf24' },
    { label: 'Pausadas', value: stats.pausedShops, icon: PauseCircle, color: '#f87171' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Dashboard</h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link href="/superadmin/shops"
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#4f46e5', borderRadius: 8, padding: '8px 14px', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
          <Store className="w-4 h-4" /> Ver barberías
        </Link>
      </div>

      {/* MRR destacado */}
      <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: 14, padding: '20px 24px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ingresos este mes</p>
          <p style={{ margin: '4px 0 0', fontSize: 36, fontWeight: 900, color: '#fff' }}>
            S/ {stats.mrrActual.toFixed(2)}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#818cf8' }}>
            {stats.newThisMonth} barberías nuevas este mes
          </p>
        </div>
        <div style={{ fontSize: 48, opacity: 0.3 }}>💈</div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Icon className="w-3.5 h-3.5" style={{ color }} />
              <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
            </div>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Barberías recientes */}
      <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #1f1f1f', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Barberías recientes</span>
          <Link href="/superadmin/shops" style={{ fontSize: 12, color: '#818cf8', textDecoration: 'none' }}>Ver todas →</Link>
        </div>
        {recentShops.map((shop: any) => {
          const sub = Array.isArray(shop.subscriptions) ? shop.subscriptions[0] : shop.subscriptions
          const statusColor = sub?.status === 'active' ? '#34d399' : sub?.status === 'trial' ? '#fbbf24' : '#f87171'
          const planLabel = sub?.plan === 'phase2' ? 'Pro' : 'Loyalty'
          return (
            <Link key={shop.id} href={`/superadmin/shops/${shop.id}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid #1a1a1a', textDecoration: 'none', color: 'inherit' }}>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{shop.nombre}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>{shop.email_admin}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: 'rgba(129,140,248,0.1)', color: '#818cf8' }}>{planLabel}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: `${statusColor}20`, color: statusColor }}>
                  {sub?.status ?? 'trial'}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
