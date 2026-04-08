import { createClient } from '@/lib/supabase/server'
import { getMyShop } from '@/lib/actions/shop'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, UserPlus } from 'lucide-react'

export default async function ClientesPage() {
  const shop = await getMyShop()
  if (!shop) redirect('/login')

  const supabase = await createClient()
  const { data: clients } = await supabase
    .from('clients')
    .select('*, loyalty_cards(visitas_actuales, tarjetas_completas, premio_pendiente)')
    .eq('shop_id', shop.id)
    .order('nombre')

  const total = clients?.length ?? 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Clientes</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, margin: '2px 0 0' }}>{total} registrados</p>
        </div>
        <Link href="/clientes/nuevo"
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 10, padding: '8px 12px', color: 'var(--gold)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
          <UserPlus className="w-4 h-4" />
          Nuevo
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {clients?.map(c => {
          const card = Array.isArray(c.loyalty_cards) ? c.loyalty_cards[0] : c.loyalty_cards
          return (
            <Link key={c.id} href={`/clientes/${c.id}`}
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {c.nombre}
                  {card?.premio_pendiente && (
                    <span style={{ fontSize: 10, background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', padding: '2px 6px', borderRadius: 20, fontWeight: 700 }}>PREMIO</span>
                  )}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                  {card ? `${card.visitas_actuales}/10 · ${card.tarjetas_completas} tarjetas` : 'Sin tarjeta'}
                </p>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--muted)' }} />
            </Link>
          )
        })}

        {total === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 12px' }}>Aún no hay clientes registrados</p>
            <Link href="/clientes/nuevo" style={{ color: 'var(--gold)', fontWeight: 600, fontSize: 14 }}>
              Registrar el primero →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
