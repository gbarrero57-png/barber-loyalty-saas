import { getMyShop, updateShop, toggleWhatsapp } from '@/lib/actions/shop'
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

      {/* WhatsApp — solo Phase 2 */}
      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 18 }}>💬</span>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>Notificaciones WhatsApp</p>
          {shop.subscription_plan !== 'phase2' && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'rgba(129,140,248,0.15)', color: '#818cf8', marginLeft: 4 }}>
              Barber Pro
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 14px' }}>
          Envía WhatsApp automáticos a tus clientes al registrar visitas y premios
        </p>

        {shop.subscription_plan !== 'phase2' ? (
          <div style={{ background: 'rgba(129,140,248,0.07)', border: '1px solid rgba(129,140,248,0.15)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#9ca3af' }}>
            Función disponible con el plan <strong style={{ color: '#818cf8' }}>Barber Pro</strong>. Contacta a tu administrador para activarlo.
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a1a1a', borderRadius: 10, padding: '12px 14px' }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
                Estado: <span style={{ color: shop.whatsapp_enabled ? '#34d399' : '#f87171' }}>
                  {shop.whatsapp_enabled ? '✅ Activo' : '⭕ Inactivo'}
                </span>
              </p>
              <p style={{ margin: '3px 0 0', fontSize: 11, color: '#6b7280' }}>
                Requiere que el cliente tenga teléfono registrado
              </p>
            </div>
            <form action={toggleWhatsapp}>
              <input type="hidden" name="whatsapp_enabled" value={shop.whatsapp_enabled ? 'false' : 'true'} />
              <button type="submit" style={{
                padding: '8px 16px', borderRadius: 8,
                border: `1px solid ${shop.whatsapp_enabled ? '#f87171' : '#34d399'}`,
                background: shop.whatsapp_enabled ? 'rgba(248,113,113,0.08)' : 'rgba(52,211,153,0.08)',
                color: shop.whatsapp_enabled ? '#f87171' : '#34d399',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>
                {shop.whatsapp_enabled ? 'Desactivar' : 'Activar'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bot WhatsApp — solo Phase 2 */}
      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 18 }}>🤖</span>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>Bot de Citas WhatsApp</p>
          {shop.subscription_plan !== 'phase2' && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'rgba(129,140,248,0.15)', color: '#818cf8', marginLeft: 4 }}>
              Barber Pro
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 14px' }}>
          Tus clientes agendan citas 24/7 por WhatsApp, sin llamadas
        </p>

        {shop.subscription_plan !== 'phase2' ? (
          <div style={{ background: 'rgba(129,140,248,0.07)', border: '1px solid rgba(129,140,248,0.15)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#9ca3af' }}>
            Función disponible con el plan <strong style={{ color: '#818cf8' }}>Barber Pro</strong>.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: '#1a1a1a', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>URL del Webhook Twilio</p>
              <code style={{ fontSize: 12, color: '#818cf8', wordBreak: 'break-all' }}>
                https://barber-loyalty-saas.vercel.app/api/whatsapp/webhook
              </code>
              <p style={{ margin: '6px 0 0', fontSize: 11, color: '#4b5563' }}>
                Configura esta URL en Twilio → Messaging → WhatsApp Senders → tu número → Webhook URL
              </p>
            </div>
            <div style={{ background: '#1a1a1a', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recordatorios automáticos</p>
              <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
                ✅ Se envían 24h antes de cada cita a clientes con teléfono registrado
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
