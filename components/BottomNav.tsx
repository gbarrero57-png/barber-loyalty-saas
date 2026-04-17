'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Scissors, Users, CalendarDays, Wallet, CreditCard, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/home',     icon: Scissors,     label: 'Inicio'   },
  { href: '/clientes', icon: Users,        label: 'Clientes' },
  { href: '/citas',    icon: CalendarDays, label: 'Agenda'   },
  { href: '/caja',     icon: Wallet,       label: 'Caja'     },
  { href: '/pagos',    icon: CreditCard,   label: 'Cobros'   },
  { href: '/admin',    icon: Settings,     label: 'Admin'    },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav style={{
      background: '#0A0A0A',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      alignItems: 'center',
      position: 'sticky',
      bottom: 0,
      zIndex: 50,
      padding: '8px 6px',
      paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
      gap: 2,
    }}>
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const isActive = href === '/home' ? pathname === '/home' : pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              padding: '6px 4px',
              borderRadius: 12,
              position: 'relative',
              minWidth: 0,
            }}
          >
            {/* Active: pill around icon + label */}
            {isActive ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'var(--yellow)',
                borderRadius: 9999,
                padding: '6px 10px',
                animation: 'navPillIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
              }}>
                <Icon style={{ width: 15, height: 15, color: '#000', flexShrink: 0 }} />
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  color: '#000',
                  fontFamily: 'var(--sans)',
                  whiteSpace: 'nowrap',
                }}>
                  {label}
                </span>
              </span>
            ) : (
              <span style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                padding: '4px 6px',
              }}>
                <Icon style={{ width: 18, height: 18, color: 'var(--muted)' }} />
                <span style={{
                  fontSize: 9,
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  fontFamily: 'var(--sans)',
                }}>
                  {label}
                </span>
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
