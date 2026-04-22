import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function esc(v: unknown): string {
  const s = v == null ? '' : String(v)
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const admin = createAdminClient()
  const { data: su } = await admin
    .from('shop_users').select('shop_id, shops(nombre)')
    .eq('user_id', user.id).limit(1).single()
  if (!su?.shop_id) return NextResponse.json({ error: 'Barbería no encontrada' }, { status: 404 })

  const shopNombre = (su.shops as any)?.nombre ?? 'barberia'
  const shopId = su.shop_id
  const now = new Date()
  const startOfMonth     = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const mesLabel = now.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })

  const [
    { count: totalClientes },
    { count: visitasMes },
    { count: visitasUltimoMes },
    { data: premiosPendientes },
    { data: topVisitas },
    { data: movimientos },
  ] = await Promise.all([
    admin.from('clients').select('*', { count: 'exact', head: true }).eq('shop_id', shopId),
    admin.from('visits').select('*', { count: 'exact', head: true }).eq('shop_id', shopId).gte('fecha', startOfMonth),
    admin.from('visits').select('*', { count: 'exact', head: true }).eq('shop_id', shopId).gte('fecha', startOfLastMonth).lt('fecha', startOfMonth),
    admin.from('loyalty_cards').select('clients(nombre), premio_texto').eq('shop_id', shopId).eq('premio_pendiente', true),
    admin.from('visits').select('client_id, clients(nombre)').eq('shop_id', shopId).gte('fecha', startOfMonth),
    admin.from('cash_movements').select('tipo, monto, categoria').eq('shop_id', shopId).gte('fecha', startOfMonth),
  ])

  const ingresos = (movimientos ?? []).filter(r => r.tipo === 'ingreso').reduce((s, r) => s + Number(r.monto), 0)
  const egresos  = (movimientos ?? []).filter(r => r.tipo === 'egreso').reduce((s, r) => s + Number(r.monto), 0)

  const porCliente: Record<string, { nombre: string; count: number }> = {}
  for (const v of topVisitas ?? []) {
    const nombre = (Array.isArray(v.clients) ? v.clients[0]?.nombre : (v.clients as any)?.nombre) ?? 'Desconocido'
    if (!porCliente[v.client_id]) porCliente[v.client_id] = { nombre, count: 0 }
    porCliente[v.client_id].count++
  }
  const top5 = Object.values(porCliente).sort((a, b) => b.count - a.count).slice(0, 5)

  const crecimiento = visitasUltimoMes && visitasUltimoMes > 0
    ? Math.round(((visitasMes ?? 0) - visitasUltimoMes) / visitasUltimoMes * 100) : null

  const lines: string[] = []

  // Header
  lines.push(`Reporte mensual — ${shopNombre} — ${mesLabel}`)
  lines.push('')

  // KPIs
  lines.push('RESUMEN')
  lines.push('Indicador,Valor')
  lines.push(`Clientes totales,${totalClientes ?? 0}`)
  lines.push(`Visitas este mes,${visitasMes ?? 0}`)
  lines.push(`Visitas mes anterior,${visitasUltimoMes ?? 0}`)
  lines.push(`Crecimiento,${crecimiento !== null ? `${crecimiento > 0 ? '+' : ''}${crecimiento}%` : 'N/A'}`)
  lines.push(`Premios pendientes,${premiosPendientes?.length ?? 0}`)
  lines.push('')

  // Caja
  lines.push('CAJA DEL MES')
  lines.push('Concepto,Monto (S/)')
  lines.push(`Ingresos,${ingresos.toFixed(2)}`)
  lines.push(`Egresos,${egresos.toFixed(2)}`)
  lines.push(`Balance,${(ingresos - egresos).toFixed(2)}`)
  lines.push('')

  // Top clientes
  if (top5.length > 0) {
    lines.push('TOP CLIENTES DEL MES')
    lines.push('Posición,Cliente,Visitas')
    top5.forEach((c, i) => lines.push(`${i + 1},${esc(c.nombre)},${c.count}`))
    lines.push('')
  }

  // Premios pendientes
  if (premiosPendientes && premiosPendientes.length > 0) {
    lines.push('PREMIOS PENDIENTES')
    lines.push('Cliente,Premio')
    for (const p of premiosPendientes) {
      const nombre = (Array.isArray(p.clients) ? p.clients[0]?.nombre : (p.clients as any)?.nombre) ?? 'Desconocido'
      lines.push(`${esc(nombre)},${esc(p.premio_texto)}`)
    }
  }

  const csv = lines.join('\n')
  const filename = `reporte_${shopNombre.replace(/\s+/g, '_')}_${now.toISOString().slice(0,7)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
