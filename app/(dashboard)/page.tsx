import Link from 'next/link'
import { UserPlus, Scissors } from 'lucide-react'
import ClientSearch from '@/components/ClientSearch'

export default function HomePage() {
  return (
    <div>
      <div className="text-center mb-7">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
          style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <Scissors className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
          <span style={{ color: 'var(--gold)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Registrar visita
          </span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Buscar Cliente</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, margin: '4px 0 0' }}>Busca por DNI, CE o nombre</p>
      </div>

      <ClientSearch />

      <div style={{ marginTop: 20 }}>
        <hr className="divider" />
        <Link href="/clientes/nuevo"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            border: '1px dashed rgba(201,168,76,0.3)', borderRadius: 12, padding: '14px',
            color: 'var(--muted)', textDecoration: 'none', fontSize: 14, fontWeight: 600,
            transition: 'color 0.2s, border-color 0.2s' }}>
          <UserPlus className="w-4 h-4" />
          Registrar nuevo cliente
        </Link>
      </div>
    </div>
  )
}
