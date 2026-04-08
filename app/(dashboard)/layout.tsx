import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyShop } from '@/lib/actions/shop'
import { logout } from '@/lib/actions/auth'
import { Scissors, Users, Settings, LogOut, BarChart2 } from 'lucide-react'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const shop = await getMyShop()
  if (!shop) redirect('/register')

  const trialDays = Math.max(0, Math.ceil(
    (new Date(shop.trial_ends_at).getTime() - Date.now()) / 86400000
  ))

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Trial banner */}
      {shop.plan === 'trial' && trialDays <= 7 && (
        <div style={{ background: 'rgba(201,168,76,0.12)', borderBottom: '1px solid rgba(201,168,76,0.2)', padding: '8px 16px', textAlign: 'center', fontSize: 13 }}>
          <span style={{ color: 'var(--gold)' }}>⏳ Trial: {trialDays} días restantes</span>
          <span style={{ color: 'var(--muted)', marginLeft: 8 }}>— S/79/mes para continuar</span>
        </div>
      )}

      {/* Top navbar */}
      <nav style={{ background: '#161616', borderBottom: '1px solid var(--border)', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5" style={{ color: 'var(--gold)' }} />
          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', letterSpacing: '-0.01em' }}>
            {shop.nombre}
          </span>
        </div>
        <form action={logout}>
          <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </nav>

      {/* Content */}
      <main style={{ flex: 1, padding: '20px 16px', maxWidth: 520, margin: '0 auto', width: '100%' }}>
        {children}
      </main>

      {/* Bottom nav */}
      <nav style={{ background: '#161616', borderTop: '1px solid var(--border)', display: 'flex', position: 'sticky', bottom: 0 }}>
        {[
          { href: '/',               icon: Scissors,  label: 'Inicio' },
          { href: '/clientes',       icon: Users,     label: 'Clientes' },
          { href: '/admin/reportes', icon: BarChart2, label: 'Reportes' },
          { href: '/admin/premios',  icon: Settings,  label: 'Admin' },
        ].map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 0', color: 'var(--muted)', fontSize: 10, fontWeight: 600, textDecoration: 'none', gap: 3 }}>
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
