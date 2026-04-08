import { getMyShop, updateShop } from '@/lib/actions/shop'
import { redirect } from 'next/navigation'

export default async function ConfiguracionPage() {
  const shop = await getMyShop()
  if (!shop) redirect('/login')

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 4px' }}>Configuración</h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 20px' }}>Datos de tu barbería</p>

      <div className="card">
        <form action={updateShop} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">Nombre</label>
            <input name="nombre" defaultValue={shop.nombre} required />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input name="telefono" defaultValue={shop.telefono ?? ''} placeholder="999 888 777" />
          </div>
          <div>
            <label className="label">Dirección</label>
            <input name="direccion" defaultValue={shop.direccion ?? ''} placeholder="Av. Lima 123" />
          </div>
          <div>
            <label className="label">Color principal</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input name="color_primario" type="color" defaultValue={shop.color_primario}
                style={{ width: 48, height: 38, padding: 2, cursor: 'pointer' }} />
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{shop.color_primario}</span>
            </div>
          </div>
          <div style={{ marginTop: 4 }}>
            <p className="label" style={{ marginBottom: 4 }}>Plan</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 12, padding: '4px 10px', borderRadius: 20, fontWeight: 700,
                background: shop.plan === 'active' ? 'rgba(74,222,128,0.1)' : 'rgba(201,168,76,0.1)',
                color: shop.plan === 'active' ? '#4ade80' : 'var(--gold)',
                border: `1px solid ${shop.plan === 'active' ? 'rgba(74,222,128,0.3)' : 'rgba(201,168,76,0.3)'}`,
              }}>
                {shop.plan === 'trial' ? '🔶 Trial' : shop.plan === 'active' ? '✅ Activo' : '❌ Cancelado'}
              </span>
              {shop.plan === 'trial' && (
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Vence: {new Date(shop.trial_ends_at).toLocaleDateString('es-PE')}
                </span>
              )}
            </div>
          </div>
          <button type="submit" className="btn-gold" style={{ marginTop: 4 }}>Guardar cambios</button>
        </form>
      </div>
    </div>
  )
}
