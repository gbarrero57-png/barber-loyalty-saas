import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function esc(v: unknown): string {
  const s = v == null ? '' : String(v)
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const admin = createAdminClient()
  const { data: su } = await admin
    .from('shop_users').select('shop_id, shops(nombre)')
    .eq('user_id', user.id).limit(1).single()
  if (!su?.shop_id) return NextResponse.json({ error: 'Barbería no encontrada' }, { status: 404 })

  const shopNombre = (su.shops as any)?.nombre ?? 'barberia'

  // Rango desde query params, default: mes actual
  const url = new URL(request.url)
  const desde = url.searchParams.get('desde')
  const hasta = url.searchParams.get('hasta')

  const start = desde
    ? new Date(desde + 'T00:00:00')
    : (() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d })()
  const end = hasta
    ? new Date(hasta + 'T23:59:59')
    : new Date()

  const { data: rows } = await admin
    .from('cash_movements')
    .select('fecha, tipo, categoria, descripcion, monto, metodo_pago, barbers(nombre)')
    .eq('shop_id', su.shop_id)
    .gte('fecha', start.toISOString())
    .lte('fecha', end.toISOString())
    .order('fecha', { ascending: false })

  const headers = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto (S/)', 'Método de pago', 'Barbero']
  const lines = [headers.join(',')]

  for (const r of rows ?? []) {
    const fecha = new Date(r.fecha).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    const barbero = (r.barbers as any)?.nombre ?? ''
    lines.push([
      esc(fecha), esc(r.tipo), esc(r.categoria), esc(r.descripcion),
      esc(Number(r.monto).toFixed(2)), esc(r.metodo_pago), esc(barbero),
    ].join(','))
  }

  // Totales al final
  const ingresos = (rows ?? []).filter(r => r.tipo === 'ingreso').reduce((s, r) => s + Number(r.monto), 0)
  const egresos  = (rows ?? []).filter(r => r.tipo === 'egreso').reduce((s, r) => s + Number(r.monto), 0)
  lines.push('')
  lines.push(`,,,Total ingresos,${ingresos.toFixed(2)},,`)
  lines.push(`,,,Total egresos,${egresos.toFixed(2)},,`)
  lines.push(`,,,Balance,${(ingresos - egresos).toFixed(2)},,`)

  const csv = lines.join('\n')
  const filename = `caja_${shopNombre.replace(/\s+/g, '_')}_${start.toISOString().slice(0,7)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
