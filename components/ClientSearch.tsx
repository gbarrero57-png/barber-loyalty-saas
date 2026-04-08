'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { searchClients } from '@/lib/actions/clients'
import { Search, Loader2, ChevronRight } from 'lucide-react'
import type { Client } from '@/lib/types'

export default function ClientSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Client[]>([])
  const [searched, setSearched] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleChange(value: string) {
    setQuery(value)
    if (value.trim().length < 2) { setResults([]); setSearched(false); return }
    startTransition(async () => {
      const data = await searchClients(value)
      setResults(data)
      setSearched(true)
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
          {isPending
            ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gold)' }} />
            : <Search className="w-5 h-5" style={{ color: 'var(--muted)' }} />
          }
        </div>
        <input
          type="search"
          value={query}
          onChange={e => handleChange(e.target.value)}
          placeholder="DNI, CE o nombre..."
          style={{ paddingLeft: 44, fontSize: 15 }}
        />
      </div>

      {searched && results.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
            No se encontró "{query}"
          </p>
          <Link href="/clientes/nuevo"
            style={{ color: 'var(--gold)', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'block', marginTop: 8 }}>
            → Registrar como nuevo cliente
          </Link>
        </div>
      )}

      {results.map(c => (
        <Link key={c.id} href={`/clientes/${c.id}`}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{c.nombre}</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>{c.dni_ce}</p>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: 'var(--muted)' }} />
        </Link>
      ))}
    </div>
  )
}
