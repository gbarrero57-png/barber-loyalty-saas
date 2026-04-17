import { createAdminClient } from '@/lib/supabase/admin'
import { getMyShop } from '@/lib/actions/shop'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, UserPlus, Users } from 'lucide-react'

export default async function ClientesPage() {
  const shop = await getMyShop()
  if (!shop) redirect('/login')

  const supabase = createAdminClient()
  const { data: clients } = await supabase
    .from('clients')
    .select('*, loyalty_cards(visitas_actuales, tarjetas_completas, premio_pendiente)')
    .eq('shop_id', shop.id)
    .order('nombre')

  const total = clients?.length ?? 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Clientes</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>{total} registrados</p>
        </div>
        <Link href="/clientes/nuevo" className="badge-gold" style={{ textDecoration: 'none', padding: '8px 14px', gap: 6, fontSize: 12 }}>
          <UserPlus style={{ width: 14, height: 14 }} />
          Nuevo
        </Link>
      </div>

      {total === 0 ? (
        <div className="empty-state">
          <Users className="w-10 h-10" style={{ margin: '0 auto', opacity: 0.2 }} />
          <p>Aún no hay clientes registrados</p>
          <Link href="/clientes/nuevo" style={{ color: 'var(--gold)', fontWeight: 600, fontSize: 14, textDecoration: 'none', display: 'block', marginTop: 12 }}>
            Registrar el primero →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {clients?.map(c => {
            const card = Array.isArray(c.loyalty_cards) ? c.loyalty_cards[0] : c.loyalty_cards
            const progress = card ? Math.round((card.visitas_actuales / 10) * 100) : 0
            return (
              <Link key={c.id} href={`/clientes/${c.id}`} className="link-client">
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 800, color: '#0C0C0C', fontFamily: 'var(--serif)',
                }}>
                  {c.nombre.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.nombre}
                    </p>
                    {card?.premio_pendiente && (
                      <span className="badge badge-gold" style={{ flexShrink: 0, fontSize: 9 }}>Premio</span>
                    )}
                  </div>
                  {card ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                      <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${progress}%`,
                          background: 'linear-gradient(90deg, var(--gold-dark), var(--gold))',
                          borderRadius: 2,
                        }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{card.visitas_actuales}/10</span>
                    </div>
                  ) : (
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>Sin tarjeta</p>
                  )}
                </div>

                <ChevronRight style={{ width: 15, height: 15, color: 'var(--muted)', flexShrink: 0 }} />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
