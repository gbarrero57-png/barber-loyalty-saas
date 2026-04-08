'use client'

import { useState, useTransition } from 'react'
import { registerVisit, redeemPrize } from '@/lib/actions/visits'
import { Scissors, Gift, Loader2, CheckCircle } from 'lucide-react'

interface Props {
  clientId: string
  premioPendiente: boolean
  visitasActuales: number
}

export default function ClientActions({ clientId, premioPendiente, visitasActuales }: Props) {
  const [msg, setMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null)
  const [isPending, startTransition] = useTransition()

  function flash(text: string, type: 'ok' | 'err') {
    setMsg({ text, type })
    setTimeout(() => setMsg(null), 3000)
  }

  function handleVisit() {
    startTransition(async () => {
      const res = await registerVisit(clientId)
      if (res.error) { flash(res.error, 'err'); return }
      if (res.tarjetaCompleta) flash('🎉 ¡Tarjeta completa! Premio desbloqueado.', 'ok')
      else flash(`✅ Sello registrado — ${visitasActuales + 1}/10`, 'ok')
    })
  }

  function handleRedeem() {
    startTransition(async () => {
      const res = await redeemPrize(clientId)
      if (res.error) { flash(res.error, 'err'); return }
      flash('✅ Premio canjeado. Nueva tarjeta iniciada.', 'ok')
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {msg && (
        <div style={{
          background: msg.type === 'ok' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
          border: `1px solid ${msg.type === 'ok' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
          borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8
        }}>
          <CheckCircle className="w-4 h-4" style={{ color: msg.type === 'ok' ? '#4ade80' : '#f87171', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: msg.type === 'ok' ? '#4ade80' : '#f87171' }}>{msg.text}</span>
        </div>
      )}

      {premioPendiente ? (
        <button onClick={handleRedeem} disabled={isPending} className="btn-gold"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
          Canjear Premio
        </button>
      ) : (
        <button onClick={handleVisit} disabled={isPending} className="btn-gold"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scissors className="w-4 h-4" />}
          Registrar Visita
        </button>
      )}
    </div>
  )
}
