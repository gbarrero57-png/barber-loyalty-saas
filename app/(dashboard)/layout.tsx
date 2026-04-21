import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyShop } from '@/lib/actions/shop'
import { logout } from '@/lib/actions/auth'
import { Scissors, LogOut } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const shop = await getMyShop()

  if (shop && !(shop as any).onboarding_done) redirect('/onboarding')

  if (!shop) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column', gap: 16,
        padding: 24, textAlign: 'center', background: '#0A0A0A',
      }}>
        <Scissors style={{ width: 28, height: 28, color: 'var(--yellow)' }} />
        <p style={{ fontSize: 17, fontWeight: 700, margin: 0, fontFamily: 'var(--serif)' }}>
          Configurando tu barbería…
        </p>
        <form action={logout}>
          <button type="submit" style={{
            background: 'none', border: '1px solid var(--border)', color: 'var(--muted)',
            padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
            fontFamily: 'var(--sans)',
          }}>
            Cerrar sesión
          </button>
        </form>
      </div>
    )
  }

  const trialDays = Math.max(0, Math.ceil(
    (new Date(shop.trial_ends_at).getTime() - Date.now()) / 86400000
  ))

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* ── Fixed background: descarga.png (scissors close-up) ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'url(/barber-scissors.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }} />
      {/* Dark overlay so content is readable */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'rgba(0,0,0,0.78)',
      }} />

      {/* Trial banner */}
      {shop.subscription_plan !== 'phase2' && trialDays <= 7 && (
        <div style={{
          position: 'relative', zIndex: 10,
          background: 'rgba(245,197,0,0.1)',
          borderBottom: '1px solid rgba(245,197,0,0.15)',
          padding: '7px 16px', textAlign: 'center', fontSize: 12,
        }}>
          <span style={{ color: 'var(--yellow)', fontWeight: 600 }}>⏳ Trial: {trialDays} días restantes</span>
          <span style={{ color: 'var(--muted)', marginLeft: 8 }}>— S/79/mes para continuar</span>
        </div>
      )}

      {/* Top navbar — glass */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '0 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60,
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500, lineHeight: 1 }}>
            {getGreeting()} 👋
          </p>
          <p style={{
            margin: '3px 0 0', fontWeight: 900, fontSize: 16,
            color: '#fff', fontFamily: 'var(--serif)', letterSpacing: '-0.01em', lineHeight: 1,
          }}>
            {shop.nombre}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, background: 'var(--yellow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Scissors style={{ width: 16, height: 16, color: '#000' }} />
          </div>
          <form action={logout}>
            <button type="submit" className="btn-logout">
              <LogOut style={{ width: 15, height: 15 }} />
            </button>
          </form>
        </div>
      </nav>

      {/* Main content */}
      <main style={{
        position: 'relative', zIndex: 10,
        flex: 1,
        padding: '24px 18px',
        maxWidth: 600,
        margin: '0 auto',
        width: '100%',
        animation: 'fadeInUp 0.32s ease-out both',
      }}>
        {children}
      </main>

      {/* Bottom nav */}
      <div style={{ position: 'relative', zIndex: 50 }}>
        <BottomNav />
      </div>
    </div>
  )
}
