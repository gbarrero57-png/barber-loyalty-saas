import Link from 'next/link'
import { Scissors, Tag, Gift, Settings, BarChart2, Clock, MessageCircle, ChevronRight } from 'lucide-react'

const SECTIONS = [
  { href: '/admin/barberos',      icon: Scissors,      label: 'Barberos',      desc: 'Gestiona tu equipo',       color: 'var(--gold)'  },
  { href: '/admin/servicios',     icon: Tag,           label: 'Servicios',     desc: 'Catálogo y precios',       color: '#34d399'      },
  { href: '/admin/horarios',      icon: Clock,         label: 'Horarios',      desc: 'Días y horas de atención', color: '#fbbf24'      },
  { href: '/admin/premios',       icon: Gift,          label: 'Premios',       desc: 'Recompensas de fidelidad', color: '#f472b6'      },
  { href: '/admin/whatsapp',      icon: MessageCircle, label: 'Bot WhatsApp',  desc: 'Agendamiento automático',  color: '#25d366'      },
  { href: '/admin/reportes',      icon: BarChart2,     label: 'Reportes',      desc: 'Métricas y estadísticas',  color: '#818cf8'      },
  { href: '/admin/configuracion', icon: Settings,      label: 'Configuración', desc: 'Datos de tu barbería',     color: 'var(--muted)' },
]

export default function AdminPage() {
  return (
    <div>
      <h1 className="page-title">Administración</h1>
      <p className="page-subtitle">Configura y gestiona tu barbería</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SECTIONS.map(({ href, icon: Icon, label, desc, color }) => (
          <Link key={href} href={href} className="admin-nav-link">
            <div style={{
              width: 42, height: 42, borderRadius: 11, flexShrink: 0,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{label}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--muted)', flexShrink: 0, transition: 'transform 0.2s' }} />
          </Link>
        ))}
      </div>
    </div>
  )
}
