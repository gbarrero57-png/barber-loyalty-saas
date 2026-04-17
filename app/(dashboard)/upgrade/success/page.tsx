import Link from 'next/link'
import { Check, Zap, MessageCircle, CalendarDays, Wallet, BarChart2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

const UNLOCKED = [
  { icon: CalendarDays,   label: 'Agenda de citas' },
  { icon: MessageCircle,  label: 'Bot WhatsApp 24/7' },
  { icon: Wallet,         label: 'Caja y finanzas' },
  { icon: BarChart2,      label: 'Reportes del negocio' },
]

export default function UpgradeSuccessPage() {
  return (
    <div style={{ paddingBottom: 40, textAlign: 'center' }}>

      {/* Checkmark hero */}
      <div style={{ marginBottom: 28, paddingTop: 16 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
          background: 'linear-gradient(135deg, #F5C500, #e6a800)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 40px rgba(245,197,0,0.45)',
          animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          <Check style={{ width: 36, height: 36, color: '#000', strokeWidth: 3 }} />
        </div>

        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'rgba(245,197,0,0.12)', border: '1px solid rgba(245,197,0,0.25)',
          borderRadius: 999, padding: '4px 14px', marginBottom: 14,
          fontSize: 11, fontWeight: 800, letterSpacing: '0.1em',
          color: 'var(--yellow)', textTransform: 'uppercase',
        }}>
          <Zap style={{ width: 10, height: 10 }} /> Barber Pro Activado
        </span>

        <h1 style={{
          margin: '0 0 12px', fontSize: 26, fontWeight: 900,
          fontFamily: 'var(--serif)', letterSpacing: '-0.02em', color: 'var(--text)',
        }}>
          ¡Bienvenido a Pro!
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
          Tu suscripción está activa. Todas las<br />funciones Pro ya están disponibles.
        </p>
      </div>

      {/* Unlocked features */}
      <div style={{
        borderRadius: 22, padding: '20px 20px',
        background: 'linear-gradient(135deg, rgba(20,16,5,0.92) 0%, rgba(30,24,8,0.92) 100%)',
        border: '1.5px solid rgba(245,197,0,0.25)',
        marginBottom: 20, textAlign: 'left',
      }}>
        <p style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,197,0,0.5)' }}>
          Ahora disponible
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {UNLOCKED.map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'var(--yellow)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon style={{ width: 16, height: 16, color: '#000' }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{label}</span>
              <Check style={{ width: 14, height: 14, color: '#4ade80', marginLeft: 'auto' }} />
            </div>
          ))}
        </div>
      </div>

      <Link href="/" style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{
          background: 'var(--yellow)', color: '#000',
          borderRadius: 999, padding: '14px 0', textAlign: 'center',
          fontSize: 15, fontWeight: 900, letterSpacing: '0.03em',
          boxShadow: '0 6px 28px rgba(245,197,0,0.35)',
        }}>
          Ir al inicio →
        </div>
      </Link>

      <p style={{ margin: '16px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
        Gestiona tu suscripción en <Link href="/upgrade" style={{ color: 'rgba(245,197,0,0.5)', textDecoration: 'none' }}>Planes</Link>
      </p>
    </div>
  )
}
