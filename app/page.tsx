import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Scissors, MessageCircle, CalendarDays, Trophy, BarChart2,
  Zap, Check, Star, ArrowRight, Wallet, Users
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const FEATURES = [
  {
    icon: MessageCircle,
    color: '#25d366',
    bg: 'rgba(37,211,102,0.08)',
    border: 'rgba(37,211,102,0.2)',
    title: 'Bot WhatsApp 24/7',
    desc: 'Tus clientes agendan citas por WhatsApp sin que tengas que responder. El bot pregunta, ofrece horarios y confirma automáticamente.',
  },
  {
    icon: Trophy,
    color: '#F5C500',
    bg: 'rgba(245,197,0,0.08)',
    border: 'rgba(245,197,0,0.2)',
    title: 'Tarjeta de Sellos Digital',
    desc: 'Registra visitas y premia la lealtad. Al completar la tarjeta, el cliente recibe su recompensa. Sin papel, sin pérdidas.',
  },
  {
    icon: CalendarDays,
    color: '#818cf8',
    bg: 'rgba(129,140,248,0.08)',
    border: 'rgba(129,140,248,0.2)',
    title: 'Agenda Inteligente',
    desc: 'Ve todos los turnos del día, evita doble-bookings y envía recordatorios automáticos 24h antes de cada cita.',
  },
  {
    icon: BarChart2,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.2)',
    title: 'Reportes del Negocio',
    desc: 'Visitas por día, top clientes del mes, ingresos y balance de caja. Todo en una pantalla, en tiempo real.',
  },
  {
    icon: Wallet,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    title: 'Caja y Finanzas',
    desc: 'Controla ingresos, egresos y balance mensual. Genera links de cobro por WhatsApp para que el cliente pague en línea.',
  },
  {
    icon: Users,
    color: '#f472b6',
    bg: 'rgba(244,114,182,0.08)',
    border: 'rgba(244,114,182,0.2)',
    title: 'Equipo Completo',
    desc: 'Gestiona múltiples barberos, asigna citas por barbero y lleva el control de ingresos de cada uno.',
  },
]

const STEPS = [
  { n: '01', title: 'Crea tu cuenta', desc: 'Registro en 2 minutos. Sin tarjeta de crédito. Empieza gratis.' },
  { n: '02', title: 'Configura tu barbería', desc: 'Agrega tus barberos, servicios y horarios. El bot queda listo al instante.' },
  { n: '03', title: 'Comparte tu WhatsApp', desc: 'Tus clientes escriben y el bot agenda por ellos. Tú te enfocas en cortar.' },
]

const PHASE2_FEATURES = [
  'Bot WhatsApp para agendar 24/7',
  'Agenda de citas completa',
  'Recordatorios automáticos',
  'Caja y control de finanzas',
  'Cobros en línea',
  'Reportes y analítica',
  'Múltiples barberos',
  'Premios personalizables',
]

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/home')

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      color: '#fff',
      fontFamily: 'var(--font-sans, Inter, sans-serif)',
      overflowX: 'hidden',
    }}>

      {/* ── Background subtle pattern ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(245,197,0,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(245,197,0,0.03) 0%, transparent 50%)',
      }} />

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(8,8,8,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '0 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 56,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: '#F5C500',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Scissors style={{ width: 15, height: 15, color: '#000' }} />
          </div>
          <span style={{ fontWeight: 900, fontSize: 15, letterSpacing: '-0.02em', fontFamily: 'var(--font-serif, Georgia)' }}>
            Barber<span style={{ color: '#F5C500' }}>Loyalty</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/login" style={{
            padding: '7px 14px', borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)',
            textDecoration: 'none',
          }}>
            Ingresar
          </Link>
          <Link href="/register" style={{
            padding: '7px 16px', borderRadius: 999,
            background: '#F5C500', color: '#000',
            fontSize: 13, fontWeight: 800, textDecoration: 'none',
          }}>
            Gratis →
          </Link>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── HERO ── */}
        <section style={{ padding: '72px 20px 56px', textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(245,197,0,0.1)', border: '1px solid rgba(245,197,0,0.2)',
            borderRadius: 999, padding: '5px 14px', marginBottom: 24,
            fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: '#F5C500',
            textTransform: 'uppercase',
          }}>
            <Zap style={{ width: 10, height: 10 }} /> Sistema de fidelidad para barberías
          </div>

          <h1 style={{
            margin: '0 0 20px', fontSize: 'clamp(32px, 8vw, 52px)',
            fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em',
            fontFamily: 'var(--font-serif, Georgia)',
          }}>
            Tu barbería en<br />
            <span style={{ color: '#F5C500' }}>piloto automático</span>
          </h1>

          <p style={{
            margin: '0 0 36px', fontSize: 16, color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.7, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto',
          }}>
            Bot de WhatsApp que agenda citas solo, tarjeta de sellos digital para fidelizar clientes, caja y reportes — todo en una app.
          </p>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', borderRadius: 999,
              background: '#F5C500', color: '#000',
              fontSize: 15, fontWeight: 900, textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(245,197,0,0.35)',
            }}>
              Empezar gratis <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
            <Link href="#precios" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '14px 24px', borderRadius: 999,
              border: '1.5px solid rgba(255,255,255,0.1)',
              fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
            }}>
              Ver planes
            </Link>
          </div>

          {/* social proof */}
          <p style={{ margin: '28px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            Sin tarjeta de crédito · Configura en 5 minutos · Cancela cuando quieras
          </p>
        </section>

        {/* ── STATS ── */}
        <section style={{ padding: '0 20px 56px', maxWidth: 640, margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 24, padding: '28px 20px',
          }}>
            {[
              { value: '24/7', label: 'Bot activo', color: '#25d366' },
              { value: '0s', label: 'Tiempo de respuesta', color: '#F5C500' },
              { value: '100%', label: 'Sin papel', color: '#818cf8' },
            ].map(({ value, label, color }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 900, color, fontFamily: 'var(--font-serif, Georgia)' }}>{value}</p>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section style={{ padding: '0 20px 64px', maxWidth: 640, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
              Todo incluido
            </p>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', fontFamily: 'var(--font-serif, Georgia)' }}>
              Una app, todo tu negocio
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {FEATURES.map(({ icon: Icon, color, bg, border, title, desc }) => (
              <div key={title} style={{
                background: bg,
                border: `1.5px solid ${border}`,
                borderRadius: 20, padding: '20px 16px',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, marginBottom: 12,
                  background: `rgba(255,255,255,0.05)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon style={{ width: 18, height: 18, color }} />
                </div>
                <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: 13, color: '#fff' }}>{title}</p>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{ padding: '0 20px 64px', maxWidth: 640, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
              Así de fácil
            </p>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', fontFamily: 'var(--font-serif, Georgia)' }}>
              Listo en 5 minutos
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {STEPS.map(({ n, title, desc }, i) => (
              <div key={n} style={{
                display: 'flex', gap: 16, alignItems: 'flex-start',
                padding: '20px 20px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 18,
              }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: i === 0 ? '#F5C500' : 'rgba(245,197,0,0.1)',
                  border: i === 0 ? 'none' : '1px solid rgba(245,197,0,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 900, color: i === 0 ? '#000' : '#F5C500',
                  letterSpacing: '0.02em',
                }}>
                  {n}
                </span>
                <div>
                  <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: 14, color: '#fff' }}>{title}</p>
                  <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="precios" style={{ padding: '0 20px 64px', maxWidth: 640, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
              Planes
            </p>
            <h2 style={{ margin: '0 0 10px', fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', fontFamily: 'var(--font-serif, Georgia)' }}>
              Empieza gratis, crece con Pro
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
              Sin contrato · Cancela cuando quieras
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Free */}
            <div style={{
              borderRadius: 22, padding: '24px 22px',
              background: 'rgba(255,255,255,0.03)',
              border: '1.5px solid rgba(255,255,255,0.08)',
            }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Básico</p>
              <p style={{ margin: '0 0 20px', fontSize: 32, fontWeight: 900, color: '#fff' }}>Gratis</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
                {['Registro de visitas', 'Tarjeta de sellos digital', 'Hasta 30 clientes', '1 barbero', 'Premio por defecto'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Check style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/register" style={{
                display: 'block', textAlign: 'center',
                padding: '12px 0', borderRadius: 999,
                border: '1.5px solid rgba(255,255,255,0.12)',
                fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
              }}>
                Crear cuenta gratis
              </Link>
            </div>

            {/* Pro */}
            <div style={{
              borderRadius: 22, padding: '24px 22px',
              background: 'linear-gradient(135deg, rgba(20,16,5,0.98) 0%, rgba(30,24,8,0.98) 100%)',
              border: '2px solid rgba(245,197,0,0.35)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,197,0,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{
                position: 'absolute', top: 16, right: 16,
                background: '#F5C500', borderRadius: 999,
                padding: '3px 10px', fontSize: 10, fontWeight: 900, color: '#000',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                ⚡ Recomendado
              </div>
              <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: 'rgba(245,197,0,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Barber Pro</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <p style={{ margin: 0, fontSize: 36, fontWeight: 900, color: '#F5C500', fontFamily: 'var(--font-serif, Georgia)' }}>S/79</p>
                <span style={{ fontSize: 13, color: 'rgba(245,197,0,0.5)', fontWeight: 600 }}>/mes</span>
              </div>
              <p style={{ margin: '0 0 20px', fontSize: 12, color: 'rgba(245,197,0,0.35)' }}>≈ S/2.63/día · Menos que un café</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
                {PHASE2_FEATURES.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 6, background: '#F5C500', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check style={{ width: 10, height: 10, color: '#000' }} />
                    </div>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/register" style={{
                display: 'block', textAlign: 'center',
                padding: '14px 0', borderRadius: 999,
                background: '#F5C500', color: '#000',
                fontSize: 15, fontWeight: 900, textDecoration: 'none',
                boxShadow: '0 6px 28px rgba(245,197,0,0.35)',
              }}>
                Empezar con Pro →
              </Link>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section style={{ padding: '0 20px 80px', maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            borderRadius: 28, padding: '48px 28px',
            background: 'linear-gradient(135deg, rgba(245,197,0,0.08) 0%, rgba(245,197,0,0.04) 100%)',
            border: '1.5px solid rgba(245,197,0,0.2)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,197,0,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, background: '#F5C500',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 8px 32px rgba(245,197,0,0.4)',
              }}>
                <Scissors style={{ width: 24, height: 24, color: '#000' }} />
              </div>
              <h2 style={{ margin: '0 0 12px', fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', fontFamily: 'var(--font-serif, Georgia)' }}>
                ¿Listo para automatizar<br />tu barbería?
              </h2>
              <p style={{ margin: '0 0 28px', fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
                Configura en 5 minutos. Sin tarjeta de crédito.<br />El primer mes de Pro gratis si activas hoy.
              </p>
              <Link href="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '15px 32px', borderRadius: 999,
                background: '#F5C500', color: '#000',
                fontSize: 16, fontWeight: 900, textDecoration: 'none',
                boxShadow: '0 8px 32px rgba(245,197,0,0.4)',
              }}>
                Crear cuenta gratis <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
              <p style={{ margin: '16px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
                Ya tienes cuenta? <Link href="/login" style={{ color: 'rgba(245,197,0,0.6)', textDecoration: 'none' }}>Ingresar →</Link>
              </p>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '24px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: '#F5C500', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scissors style={{ width: 12, height: 12, color: '#000' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.5)' }}>BarberLoyalty</span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
            © 2026 · Hecho para barberías que crecen
          </p>
        </footer>
      </div>
    </div>
  )
}
