import { getMyShop } from '@/lib/actions/shop'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, ArrowLeft, Zap, CheckCircle, Copy } from 'lucide-react'
import UpgradeGate from '@/components/UpgradeGate'

async function saveBotConfig(formData: FormData) {
  'use server'
  const shop = await getMyShop()
  if (!shop) return

  const admin = createAdminClient()
  await admin.from('shops').update({
    bot_twilio_number: (formData.get('bot_twilio_number') as string).trim() || null,
    bot_enabled:       formData.get('bot_enabled') === 'on',
  }).eq('id', shop.id)

  revalidatePath('/admin/whatsapp')
}

export const dynamic = 'force-dynamic'

export default async function WhatsappPage() {
  const shop = await getMyShop()
  if (!shop) redirect('/login')

  const isPhase2 = shop.subscription_plan === 'phase2'

  if (!isPhase2) {
    return (
      <div>
        <Link href="/admin" className="link-back" style={{ marginBottom: 18, display: 'inline-flex' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Admin
        </Link>
        <h1 className="page-title">Bot WhatsApp</h1>
        <p className="page-subtitle" style={{ marginBottom: 24 }}>Agendamiento automático 24/7</p>
        <UpgradeGate
          feature="Bot WhatsApp de Citas"
          description="Tu barbería atiende citas por WhatsApp las 24 horas, sin que tengas que responder manualmente. El bot pregunta servicio, barbero, fecha y hora — y crea la cita automáticamente."
          icon={MessageCircle}
          bullets={[
            'Agenda citas sin intervención humana',
            'Disponible 24/7 — fines de semana incluidos',
            'Muestra horarios libres en tiempo real',
            'Confirmación automática al cliente',
            'Recordatorios 24h antes de la cita',
          ]}
          hint="El bot se conecta a tu número de WhatsApp Business"
        />
      </div>
    )
  }

  const admin = createAdminClient()
  const { data: shopData } = await admin
    .from('shops')
    .select('bot_twilio_number, bot_enabled')
    .eq('id', shop.id)
    .single()

  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://barber-loyalty-saas.vercel.app'}/api/whatsapp/webhook`

  return (
    <div>
      <Link href="/admin" className="link-back" style={{ marginBottom: 18, display: 'inline-flex' }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Admin
      </Link>
      <h1 className="page-title">Bot WhatsApp</h1>
      <p className="page-subtitle" style={{ marginBottom: 20 }}>Agendamiento automático 24/7</p>

      {/* Estado */}
      <div style={{
        borderRadius: 18, padding: '16px 18px', marginBottom: 16,
        background: shopData?.bot_enabled
          ? 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(52,211,153,0.04))'
          : 'rgba(12,12,12,0.6)',
        border: `1.5px solid ${shopData?.bot_enabled ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.06)'}`,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: shopData?.bot_enabled ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {shopData?.bot_enabled
            ? <CheckCircle style={{ width: 20, height: 20, color: '#34d399' }} />
            : <MessageCircle style={{ width: 20, height: 20, color: 'var(--muted)' }} />
          }
        </div>
        <div>
          <p style={{ margin: '0 0 2px', fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>
            Bot {shopData?.bot_enabled ? 'activo' : 'inactivo'}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
            {shopData?.bot_twilio_number
              ? `Número: ${shopData.bot_twilio_number}`
              : 'Configura tu número de Twilio abajo'}
          </p>
        </div>
        {shopData?.bot_enabled && (
          <span style={{
            marginLeft: 'auto', flexShrink: 0,
            background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)',
            borderRadius: 999, padding: '3px 10px', fontSize: 10, fontWeight: 800,
            color: '#34d399', letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            EN LÍNEA
          </span>
        )}
      </div>

      {/* Config form */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="label" style={{ marginBottom: 14 }}>Configuración</p>
        <form action={saveBotConfig} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">Número Twilio WhatsApp</label>
            <input
              name="bot_twilio_number"
              placeholder="+13186683828"
              defaultValue={shopData?.bot_twilio_number ?? ''}
            />
            <p style={{ margin: '5px 0 0', fontSize: 11, color: 'var(--muted)' }}>
              El número de Twilio que recibe mensajes de WhatsApp
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              name="bot_enabled"
              type="checkbox"
              id="bot_enabled"
              defaultChecked={shopData?.bot_enabled ?? false}
              style={{ width: 'auto', padding: 0 }}
            />
            <label htmlFor="bot_enabled" style={{ fontSize: 13, color: 'var(--text)', textTransform: 'none', letterSpacing: 'normal', margin: 0, fontWeight: 600 }}>
              Bot activo
            </label>
          </div>
          <button type="submit" className="btn-gold">Guardar configuración</button>
        </form>
      </div>

      {/* Webhook URL */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="label" style={{ marginBottom: 12 }}>URL del Webhook</p>
        <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
          Pega esta URL en Twilio Console → tu número → Messaging → "When a message comes in":
        </p>
        <div style={{
          background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10, padding: '12px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        }}>
          <code style={{ fontSize: 11, color: 'var(--yellow)', wordBreak: 'break-all', lineHeight: 1.6 }}>
            {webhookUrl}
          </code>
        </div>
        <p style={{ margin: '10px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
          Método: HTTP POST
        </p>
      </div>

      {/* Setup guide */}
      <div className="section-card">
        <p className="section-title"><Zap className="w-3.5 h-3.5" /> Cómo activar el bot</p>
        <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            'Crea una cuenta en twilio.com y activa WhatsApp Sandbox (gratis para pruebas)',
            'Copia el número de Twilio (ej: +1 415 523 8886) y pégalo arriba',
            'En Twilio Console → tu número → pega la URL del webhook en "When a message comes in"',
            'Activa el bot con el toggle de arriba',
            'Envía "hola" al número desde WhatsApp para probar',
          ].map((step, i) => (
            <li key={i} style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text)' }}>Paso {i + 1}:</strong> {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
