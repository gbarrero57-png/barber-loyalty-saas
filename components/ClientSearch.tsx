'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { searchClients } from '@/lib/actions/clients'
import { Search, Loader2, ChevronRight, UserPlus } from 'lucide-react'
import type { Client } from '@/lib/types'

export default function ClientSearch() {
  const [query, setQuery]     = useState('')
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
      {/* Search input */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 14, top: '50%',
          transform: 'translateY(-50%)', zIndex: 1,
          transition: 'opacity 0.2s',
        }}>
          {isPending
            ? <Loader2 className="w-4.5 h-4.5 animate-spin" style={{ color: 'var(--gold)', width: 18, height: 18 }} />
            : <Search style={{ color: query ? 'var(--gold)' : 'var(--muted)', width: 18, height: 18, transition: 'color 0.22s' }} />
          }
        </div>
        <input
          type="search"
          value={query}
          onChange={e => handleChange(e.target.value)}
          placeholder="DNI, CE o nombre del cliente…"
          autoComplete="off"
          style={{
            paddingLeft: 44,
            paddingRight: 14,
            fontSize: 15,
            height: 50,
            background: 'var(--bg-input)',
            border: `1px solid ${query ? 'rgba(201,168,76,0.3)' : 'var(--border)'}`,
            transition: 'border-color 0.22s, box-shadow 0.22s',
          }}
        />
      </div>

      {/* No results */}
      {searched && results.length === 0 && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '18px 20px',
          textAlign: 'center',
          animation: 'fadeInUp 0.28s ease-out both',
        }}>
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 10px' }}>
            No se encontró "{query}"
          </p>
          <Link href="/clientes/nuevo" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'var(--gold)', fontSize: 13, fontWeight: 600, textDecoration: 'none',
            padding: '6px 14px', borderRadius: 8,
            border: '1px solid rgba(201,168,76,0.2)',
            background: 'rgba(201,168,76,0.06)',
            transition: 'background 0.2s, border-color 0.2s',
          }}>
            <UserPlus style={{ width: 14, height: 14 }} />
            Registrar como nuevo cliente
          </Link>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {results.map((c, i) => (
            <Link
              key={c.id}
              href={`/clientes/${c.id}`}
              style={{
                textDecoration: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '13px 16px',
                transition: 'border-color 0.22s, background 0.22s, transform 0.15s',
                animation: `fadeInUp 0.3s ease-out ${i * 0.05}s both`,
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.borderColor = 'rgba(201,168,76,0.3)'
                el.style.background = '#1A1A1A'
                el.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.borderColor = 'var(--border)'
                el.style.background = 'var(--bg-card)'
                el.style.transform = 'translateY(0)'
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                  {c.nombre}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em' }}>
                  {c.dni_ce}
                </p>
              </div>
              <ChevronRight style={{ color: 'var(--muted)', width: 16, height: 16, flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
