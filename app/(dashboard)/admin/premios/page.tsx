import { createClient } from '@/lib/supabase/server'
import { getMyShop } from '@/lib/actions/shop'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Trophy } from 'lucide-react'
import Link from 'next/link'
import UpgradeGate from '@/components/UpgradeGate'

async function saveReward(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const shop = await getMyShop()
  if (!shop) return

  const tarjeta_num = parseInt(formData.get('tarjeta_num') as string)
  const premio_texto = (formData.get('premio_texto') as string).trim()
  const es_default = formData.get('es_default') === 'on'

  if (es_default) {
    await supabase.from('rewards_config').update({ es_default: false }).eq('shop_id', shop.id)
  }
  await supabase.from('rewards_config').upsert(
    { shop_id: shop.id, tarjeta_num, premio_texto, es_default, activo: true },
    { onConflict: 'shop_id,tarjeta_num' }
  )
  revalidatePath('/admin/premios')
}

export const dynamic = 'force-dynamic'

export default async function PremiosPage() {
  const shop = await getMyShop()
  if (!shop) redirect('/login')

  const isPhase2 = shop.subscription_plan === 'phase2'
  const supabase = await createClient()
  const { data: rewards } = await supabase
    .from('rewards_config').select('*').eq('shop_id', shop.id).order('tarjeta_num')

  return (
    <div>
      <Link href="/admin" className="link-back" style={{ marginBottom: 18, display: 'inline-flex' }}>
        ← Admin
      </Link>
      <h1 className="page-title">Premios</h1>
      <p className="page-subtitle" style={{ marginBottom: 20 }}>Premio que recibe el cliente al completar su tarjeta</p>

      {/* Premios configurados */}
      {rewards && rewards.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {rewards.map((r: any) => (
            <div key={r.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
              <div>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>Tarjeta #{r.tarjeta_num}</span>
                <p style={{ margin: '2px 0 0', fontWeight: 700, fontSize: 14 }}>{r.premio_texto}</p>
              </div>
              {r.es_default && <span className="badge badge-gold">DEFAULT</span>}
            </div>
          ))}
        </div>
      )}

      {/* Phase 1: solo pueden editar/ver el default */}
      {!isPhase2 ? (
        <>
          {/* Permiten editar solo el premio default */}
          <div className="card" style={{ marginBottom: 16 }}>
            <p className="label" style={{ marginBottom: 14 }}>Premio por defecto</p>
            <form action={saveReward} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input type="hidden" name="tarjeta_num" value="1" />
              <input type="hidden" name="es_default" value="on" />
              <div>
                <label className="label">Premio al completar 10 sellos</label>
                <input name="premio_texto" placeholder="Ej: Corte gratis" required
                  defaultValue={rewards?.find((r: any) => r.es_default)?.premio_texto ?? ''} />
              </div>
              <button type="submit" className="btn-gold">Guardar premio</button>
            </form>
          </div>

          <UpgradeGate
            feature="Premios Personalizables"
            description="Con Barber Pro configura un premio diferente para cada tarjeta completada. La 1ra tarjeta un descuento, la 5ta un corte gratis, la 10ma algo especial."
            icon={Trophy}
            bullets={[
              'Premio distinto por número de tarjeta',
              'Personaliza el nombre del premio',
              'Múltiples niveles de recompensa',
              'Mayor retención de clientes',
            ]}
            hint="Los clientes vuelven más cuando saben lo que ganan"
          />
        </>
      ) : (
        /* Phase 2: configuración completa */
        <div className="card">
          <p className="label" style={{ marginBottom: 14 }}>Agregar / editar premio</p>
          <form action={saveReward} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="label">Número de tarjeta</label>
              <input name="tarjeta_num" type="number" min={1} defaultValue={1} required />
            </div>
            <div>
              <label className="label">Premio</label>
              <input name="premio_texto" placeholder="Ej: Corte gratis" required />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input name="es_default" type="checkbox" style={{ width: 'auto', padding: 0 }} id="default" />
              <label htmlFor="default" style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'none', letterSpacing: 'normal', margin: 0 }}>
                Premio por defecto
              </label>
            </div>
            <button type="submit" className="btn-gold">Guardar premio</button>
          </form>
        </div>
      )}
    </div>
  )
}
