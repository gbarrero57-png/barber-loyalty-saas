'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getMyShop } from '@/lib/actions/shop'

export async function getClientPayments(limit = 30) {
  const shop = await getMyShop()
  if (!shop) return []
  const admin = createAdminClient()
  const { data } = await admin
    .from('client_payments')
    .select('*, appointments(client_nombre, fecha_inicio, services(nombre))')
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getPaymentStats() {
  const shop = await getMyShop()
  if (!shop) return { totalMes: 0, totalHoy: 0, totalPagos: 0 }
  const admin = createAdminClient()
  const now = new Date()
  const mesStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const hoyStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  const [{ data: mes }, { data: hoy }] = await Promise.all([
    admin.from('client_payments').select('monto').eq('shop_id', shop.id).eq('estado', 'pagado').gte('created_at', mesStart),
    admin.from('client_payments').select('monto').eq('shop_id', shop.id).eq('estado', 'pagado').gte('created_at', hoyStart),
  ])

  return {
    totalMes:   (mes ?? []).reduce((s, p) => s + Number(p.monto), 0),
    totalHoy:   (hoy ?? []).reduce((s, p) => s + Number(p.monto), 0),
    totalPagos: (mes ?? []).length,
  }
}

export async function getPaymentLink(shopSlug: string, appointmentId: string, monto: number, concepto: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://barber-loyalty-saas.vercel.app'
  const params = new URLSearchParams({ appt: appointmentId, monto: monto.toFixed(2), concepto })
  return `${baseUrl}/pagar/${shopSlug}?${params.toString()}`
}
