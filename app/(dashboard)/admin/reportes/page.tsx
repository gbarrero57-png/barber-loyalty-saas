import { getMyShop } from '@/lib/actions/shop'
import { getCajaStats } from '@/lib/actions/caja'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { Users, Scissors, Trophy, TrendingUp, BarChart2, Download } from 'lucide-react'
import Link from 'next/link'
import UpgradeGate from '@/components/UpgradeGate'

export const dynamic = 'force-dynamic'

export default async function ReportesPage() {
  const shop = await getMyShop()
  if (!shop) redirect('/login')

  const isPhase2 = shop.subscription_plan === 'phase2'

  if (!isPhase2) {
    return (
      <div>
        <Link href="/admin" className="link-back" style={{ marginBottom: 18, display: 'inline-flex' }}>
          ← Admin
        </Link>
        <h1 className="page-title">Reportes</h1>
        <p className="page-subtitle" style={{ marginBottom: 24 }}>Análisis y métricas del negocio</p>
        <UpgradeGate
          feature="Reportes y Analítica"
          description="Entiende el rendimiento de tu barbería con datos reales: qué días son más activos, quiénes son tus mejores clientes y cómo crece el negocio."
          icon={BarChart2}
          bullets={[
            'Visitas por día del mes (gráfico)',
            'Top 5 clientes del mes',
            'Comparativa mes anterior',
            'Ingresos, egresos y balance',
            'Premios pendientes de canjear',
          ]}
        />
      </div>
    )
  }

  const admin = createAdminClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

  const [cajaStats, [
    { count: totalClientes },
    { count: visitasMes },
    { count: visitasUltimoMes },
    { data: premiosPendientes },
    { data: topClientes },
    { data: visitasPorDia },
  ]] = await Promise.all([
    getCajaStats(),
    Promise.all([
      admin.from('clients').select('*', { count: 'exact', head: true }).eq('shop_id', shop.id),
      admin.from('visits').select('*', { count: 'exact', head: true }).eq('shop_id', shop.id).gte('fecha', startOfMonth),
      admin.from('visits').select('*', { count: 'exact', head: true }).eq('shop_id', shop.id).gte('fecha', startOfLastMonth).lt('fecha', startOfMonth),
      admin.from('loyalty_cards').select('client_id, premio_texto, clients(nombre)').eq('shop_id', shop.id).eq('premio_pendiente', true),
      admin.from('visits').select('client_id, clients(nombre)').eq('shop_id', shop.id).gte('fecha', startOfMonth),
      admin.from('visits').select('fecha').eq('shop_id', shop.id).gte('fecha', startOfMonth).order('fecha'),
    ]),
  ])

  const visitasPorCliente: Record<string, { nombre: string; count: number }> = {}
  topClientes?.forEach((v: any) => {
    const id = v.client_id
    const nombre = Array.isArray(v.clients) ? v.clients[0]?.nombre : (v.clients as any)?.nombre
    if (!visitasPorCliente[id]) visitasPorCliente[id] = { nombre: nombre ?? 'Desconocido', count: 0 }
    visitasPorCliente[id].count++
  })
  const top5 = Object.values(visitasPorCliente).sort((a, b) => b.count - a.count).slice(0, 5)

  const diasDelMes = now.getDate()
  const visitasDia = Array.from({ length: diasDelMes }, (_, i) => {
    const day = i + 1
    return visitasPorDia?.filter(v => new Date(v.fecha).getDate() === day).length ?? 0
  })
  const maxDia = Math.max(...visitasDia, 1)

  const crecimiento = visitasUltimoMes && visitasUltimoMes > 0
    ? Math.round(((visitasMes ?? 0) - visitasUltimoMes) / visitasUltimoMes * 100)
    : null

  return (
    <div>
      <Link href="/admin" className="link-back" style={{ marginBottom: 18, display: 'inline-flex' }}>← Admin</Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Reportes</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>{now.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}</p>
        </div>
        <a
          href="/api/export/reportes"
          download
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
            background: 'rgba(245,197,0,0.1)', border: '1px solid rgba(245,197,0,0.2)',
            color: 'var(--yellow)', textDecoration: 'none', whiteSpace: 'nowrap',
          }}
        >
          <Download style={{ width: 13, height: 13 }} /> Exportar CSV
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[
          { icon: Users,      label: 'Clientes totales',  value: totalClientes ?? 0,          color: '#818cf8' },
          { icon: Scissors,   label: 'Visitas este mes',  value: visitasMes ?? 0,              color: 'var(--yellow)', sub: crecimiento !== null ? `${crecimiento > 0 ? '+' : ''}${crecimiento}% vs mes ant.` : undefined },
          { icon: Trophy,     label: 'Premios pendientes',value: premiosPendientes?.length ?? 0, color: '#f59e0b' },
          { icon: TrendingUp, label: 'Visitas mes ant.',  value: visitasUltimoMes ?? 0,        color: '#34d399' },
        ].map(({ icon: Icon, label, value, color, sub }: any) => (
          <div key={label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Icon className="w-4 h-4" style={{ color }} />
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
            </div>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color }}>{value}</p>
            {sub && <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--muted)' }}>{sub}</p>}
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <p className="label" style={{ marginBottom: 12 }}>Visitas por día — {now.toLocaleDateString('es-PE', { month: 'long' })}</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 60 }}>
          {visitasDia.map((v, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '100%', borderRadius: 3,
                height: Math.max(3, Math.round((v / maxDia) * 52)),
                background: v > 0 ? 'var(--yellow)' : 'rgba(255,255,255,0.04)',
              }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: 'var(--muted)' }}>1</span>
          <span style={{ fontSize: 10, color: 'var(--muted)' }}>{diasDelMes}</span>
        </div>
      </div>

      {top5.length > 0 && (
        <div className="card" style={{ marginBottom: 12 }}>
          <p className="label" style={{ marginBottom: 10 }}>Top clientes este mes</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {top5.map((c, i) => (
              <div key={c.nombre} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 20, fontSize: 12, fontWeight: 800, color: i === 0 ? 'var(--yellow)' : 'var(--muted)', textAlign: 'center' }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{c.nombre}</span>
                    <span style={{ fontSize: 12, color: 'var(--yellow)', fontWeight: 700 }}>{c.count} visitas</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 2, width: `${(c.count / top5[0].count) * 100}%`, background: 'var(--yellow)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p className="label" style={{ margin: 0 }}>Caja este mes</p>
          <Link href="/caja" style={{ fontSize: 12, color: '#818cf8', textDecoration: 'none' }}>Ver detalle →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'INGRESOS', value: `S/ ${cajaStats.ingresosMes.toFixed(2)}`, color: '#4ade80', bg: '#34d39910' },
            { label: 'EGRESOS',  value: `S/ ${cajaStats.egresosMes.toFixed(2)}`,  color: '#f87171', bg: '#f8717110' },
            { label: 'BALANCE',  value: `S/ ${cajaStats.balanceMes.toFixed(2)}`,  color: cajaStats.balanceMes >= 0 ? '#818cf8' : '#f87171', bg: cajaStats.balanceMes >= 0 ? '#818cf810' : '#f8717110' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{ textAlign: 'center', padding: '10px 0', background: bg, borderRadius: 10 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color }}>{value}</p>
              <p style={{ margin: '2px 0 0', fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
