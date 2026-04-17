import { getAllShops, setShopPlan, setShopStatus, extendTrial, recordPayment, setBotConfig } from '@/lib/actions/superadmin'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { ArrowLeft, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default async function ShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const [{ data: shop }, { data: payments }, { count: totalClientes }, { count: totalVisitas }] = await Promise.all([
    admin.from('shops').select('*, subscriptions(*)').eq('id', id).single(),
    admin.from('payments').select('*').eq('shop_id', id).order('fecha', { ascending: false }).limit(10),
    admin.from('clients').select('*', { count: 'exact', head: true }).eq('shop_id', id),
    admin.from('visits').select('*', { count: 'exact', head: true }).eq('shop_id', id),
  ])

  if (!shop) notFound()

  const sub = Array.isArray(shop.subscriptions) ? shop.subscriptions[0] : shop.subscriptions
  const status = sub?.status ?? 'trial'
  const plan = sub?.plan ?? 'phase1'
  const trialEnd = new Date(sub?.trial_ends_at ?? shop.trial_ends_at)
  const trialDays = Math.ceil((trialEnd.getTime() - Date.now()) / 86400000)

  const setShopPlanAction = setShopPlan.bind(null, id)
  const setShopStatusAction = setShopStatus.bind(null, id)
  const extendTrialAction = extendTrial.bind(null, id)
  const setBotConfigAction = setBotConfig.bind(null, id)

  return (
    <div>
      <Link href="/superadmin/shops" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#6b7280', fontSize: 13, textDecoration: 'none', marginBottom: 20 }}>
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>{shop.nombre}</h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>{shop.email_admin}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: plan === 'phase2' ? 'rgba(129,140,248,0.15)' : 'rgba(201,168,76,0.1)', color: plan === 'phase2' ? '#818cf8' : '#C9A84C' }}>
            {plan === 'phase2' ? '💈 Barber Pro' : '✂️ Loyalty'}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: status === 'active' ? '#34d39920' : status === 'trial' ? '#fbbf2420' : '#f8717120', color: status === 'active' ? '#34d399' : status === 'trial' ? '#fbbf24' : '#f87171' }}>
            {status}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Clientes', value: totalClientes ?? 0 },
          { label: 'Visitas totales', value: totalVisitas ?? 0 },
          { label: 'Trial restante', value: trialDays > 0 ? `${trialDays}d` : 'Vencido' },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#e5e7eb' }}>{value}</p>
            <p style={{ margin: '3px 0 0', fontSize: 11, color: '#6b7280' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Controles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {/* Cambiar plan */}
        <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, padding: 16 }}>
          <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Plan</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <form action={async () => { 'use server'; await setShopPlanAction('phase1') }}>
              <button type="submit" style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${plan === 'phase1' ? '#C9A84C' : '#2a2a2a'}`, background: plan === 'phase1' ? 'rgba(201,168,76,0.1)' : 'transparent', color: plan === 'phase1' ? '#C9A84C' : '#9ca3af', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                ✂️ Loyalty
              </button>
            </form>
            <form action={async () => { 'use server'; await setShopPlanAction('phase2') }}>
              <button type="submit" style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${plan === 'phase2' ? '#818cf8' : '#2a2a2a'}`, background: plan === 'phase2' ? 'rgba(129,140,248,0.1)' : 'transparent', color: plan === 'phase2' ? '#818cf8' : '#9ca3af', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                💈 Pro
              </button>
            </form>
          </div>
        </div>

        {/* Cambiar estado */}
        <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, padding: 16 }}>
          <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estado</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(['active', 'paused', 'cancelled'] as const).map(s => (
              <form key={s} action={async () => { 'use server'; await setShopStatusAction(s) }}>
                <button type="submit" style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${status === s ? '#4ade80' : '#2a2a2a'}`, background: status === s ? 'rgba(74,222,128,0.08)' : 'transparent', color: status === s ? '#4ade80' : '#9ca3af', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {s === 'active' ? '✅ Activa' : s === 'paused' ? '⏸ Pausar' : '❌ Cancelar'}
                </button>
              </form>
            ))}
          </div>
        </div>
      </div>

      {/* Extender trial */}
      <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Extender trial</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {[7, 14, 30].map(days => (
            <form key={days} action={async () => { 'use server'; await extendTrialAction(days) }}>
              <button type="submit" style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #2a2a2a', background: 'transparent', color: '#fbbf24', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                +{days} días
              </button>
            </form>
          ))}
        </div>
      </div>

      {/* Bot WhatsApp config */}
      <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          🤖 Bot WhatsApp
        </p>
        <form action={setBotConfigAction} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, alignItems: 'end' }}>
          <div>
            <p style={{ margin: '0 0 5px', fontSize: 11, color: '#6b7280' }}>Número Twilio (+13186683828)</p>
            <input name="bot_twilio_number" defaultValue={(shop as any).bot_twilio_number ?? ''}
              placeholder="+13186683828"
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <div>
            <p style={{ margin: '0 0 5px', fontSize: 11, color: '#6b7280' }}>Estado bot</p>
            <select name="bot_enabled"
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 13 }}>
              <option value="true" selected={(shop as any).bot_enabled === true}>✅ Activo</option>
              <option value="false" selected={!(shop as any).bot_enabled}>⭕ Inactivo</option>
            </select>
          </div>
          <button type="submit"
            style={{ background: '#4f46e5', border: 'none', borderRadius: 8, padding: '8px 14px', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            Guardar
          </button>
        </form>
      </div>

      {/* Registrar pago */}
      <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 5 }}>
          <DollarSign className="w-3.5 h-3.5" /> Registrar pago recibido
        </p>
        <form action={recordPayment} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <input type="hidden" name="shop_id" value={id} />
          <input name="monto" type="number" placeholder="Monto (S/)" step="0.01" required
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 13 }} />
          <select name="metodo" required
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 13 }}>
            <option value="yape">Yape</option>
            <option value="transferencia">Transferencia</option>
            <option value="efectivo">Efectivo</option>
            <option value="culqi">Culqi</option>
          </select>
          <input name="periodo" type="text" placeholder="Ej: May 2026"
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 13 }} />
          <input name="referencia" type="text" placeholder="N° operación (opcional)"
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 13, gridColumn: '1/3' }} />
          <button type="submit"
            style={{ background: '#16a34a', border: 'none', borderRadius: 8, padding: '8px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            ✓ Registrar
          </button>
        </form>
      </div>

      {/* Historial de pagos */}
      {(payments?.length ?? 0) > 0 && (
        <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, overflow: 'hidden' }}>
          <p style={{ margin: 0, padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #1f1f1f' }}>
            Historial de pagos
          </p>
          {payments!.map((p: any) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #161616' }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
                  S/ {Number(p.monto).toFixed(2)}
                  <span style={{ marginLeft: 8, fontSize: 11, color: '#6b7280' }}>{p.metodo}</span>
                  {p.periodo && <span style={{ marginLeft: 6, fontSize: 11, color: '#818cf8' }}>{p.periodo}</span>}
                </p>
                {p.referencia && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6b7280' }}>Ref: {p.referencia}</p>}
              </div>
              <span style={{ fontSize: 11, color: '#6b7280' }}>
                {new Date(p.fecha).toLocaleDateString('es-PE')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
