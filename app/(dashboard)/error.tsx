'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16,
    }}>
      <p style={{ fontWeight: 800, fontSize: 16, color: '#f87171', margin: 0 }}>
        Error del servidor
      </p>
      <pre style={{
        background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
        borderRadius: 10, padding: '12px 16px', fontSize: 12, color: '#fca5a5',
        maxWidth: 560, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
      }}>
        {error?.message ?? 'Error desconocido'}
        {'\n\n'}
        {error?.digest ? `Digest: ${error.digest}` : ''}
      </pre>
      <button
        onClick={reset}
        style={{
          background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff', borderRadius: 8, padding: '8px 20px', fontSize: 13,
          cursor: 'pointer', fontFamily: 'var(--sans)',
        }}
      >
        Reintentar
      </button>
    </div>
  )
}
