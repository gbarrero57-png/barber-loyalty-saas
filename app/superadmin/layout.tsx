import { requireSuperAdmin, superAdminLogout } from '@/lib/actions/superadmin'
import Link from 'next/link'
import { Shield, LayoutDashboard, Store, LogOut } from 'lucide-react'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  // /superadmin/login no necesita auth — lo manejamos con try/catch
  let isAuthed = true
  try {
    await requireSuperAdmin()
  } catch {
    // requireSuperAdmin hace redirect a /superadmin/login si no está autenticado
    isAuthed = false
  }

  if (!isAuthed) return <>{children}</>

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e5e7eb' }}>
      {/* Topbar */}
      <nav style={{ background: '#111', borderBottom: '1px solid #1f1f1f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 52, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield className="w-4 h-4" style={{ color: '#818cf8' }} />
            <span style={{ fontWeight: 800, fontSize: 14, color: '#818cf8' }}>SuperAdmin</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { href: '/superadmin', icon: LayoutDashboard, label: 'Dashboard' },
              { href: '/superadmin/shops', icon: Store, label: 'Barberías' },
            ].map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, color: '#9ca3af', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </div>
        </div>
        <form action={superAdminLogout}>
          <button type="submit" style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
            <LogOut className="w-3.5 h-3.5" /> Salir
          </button>
        </form>
      </nav>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px' }}>
        {children}
      </main>
    </div>
  )
}
