import { createClient } from '@/lib/supabase/server'
import { getMyShop } from '@/lib/actions/shop'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function saveReward(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const shop = await getMyShop()
  if (!shop) return

  const tarjeta_num = parseInt(formData.get('tarjeta_num') as string)
  const premio_texto = (formData.get('premio_texto') as string).trim()
  const es_default = formData.get('es_default') === 'on'

  if (es_default) {
    await supabase.from('rewards_config')
      .update({ es_default: false })
      .eq('shop_id', shop.id)
  }

  await supabase.from('rewards_config').upsert({
    shop_id: shop.id, tarjeta_num, premio_texto, es_default, activo: true
  }, { onConflict: 'shop_id,tarjeta_num' })

  revalidatePath('/admin/premios')
}

export default async function PremiosPage() {
  const shop = await getMyShop()
  if (!shop) redirect('/login')

  const supabase = await createClient()
  const { data: rewards } = await supabase
    .from('rewards_config')
    .select('*')
    .eq('shop_id', shop.id)
    .order('tarjeta_num')

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 4px' }}>Premios</h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 20px' }}>Configura el premio de cada tarjeta completada</p>

      {/* Lista de premios existentes */}
      {rewards && rewards.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {rewards.map(r => (
            <div key={r.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
              <div>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>Tarjeta #{r.tarjeta_num}</span>
                <p style={{ margin: '2px 0 0', fontWeight: 700, fontSize: 14 }}>{r.premio_texto}</p>
              </div>
              {r.es_default && (
                <span style={{ fontSize: 10, background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', padding: '3px 8px', borderRadius: 20, fontWeight: 700 }}>
                  DEFAULT
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Formulario para agregar */}
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
              Premio por defecto (se usa cuando no hay config para esa tarjeta)
            </label>
          </div>
          <button type="submit" className="btn-gold">Guardar premio</button>
        </form>
      </div>
    </div>
  )
}
