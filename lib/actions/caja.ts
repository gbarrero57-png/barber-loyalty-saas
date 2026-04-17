'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getMyShop } from '@/lib/actions/shop'
import { revalidatePath } from 'next/cache'

export async function getCajaMovements(desde?: string, hasta?: string) {
  const shop = await getMyShop()
  if (!shop) return []
  const admin = createAdminClient()

  const start = desde
    ? new Date(desde + 'T00:00:00')
    : (() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d })()
  const end = hasta
    ? new Date(hasta + 'T23:59:59')
    : new Date()

  const { data } = await admin
    .from('cash_movements')
    .select('*, barbers(nombre)')
    .eq('shop_id', shop.id)
    .gte('fecha', start.toISOString())
    .lte('fecha', end.toISOString())
    .order('fecha', { ascending: false })
  return data ?? []
}

export async function getCajaStats() {
  const shop = await getMyShop()
  if (!shop) return { ingresosMes: 0, egresosMes: 0, balanceMes: 0, ingresosHoy: 0 }
  const admin = createAdminClient()

  const now = new Date()
  const mesStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const hoyStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const hoyEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()

  const [{ data: mes }, { data: hoy }] = await Promise.all([
    admin.from('cash_movements')
      .select('tipo, monto')
      .eq('shop_id', shop.id)
      .gte('fecha', mesStart),
    admin.from('cash_movements')
      .select('tipo, monto')
      .eq('shop_id', shop.id)
      .gte('fecha', hoyStart)
      .lte('fecha', hoyEnd),
  ])

  const ingresosMes = (mes ?? []).filter(r => r.tipo === 'ingreso').reduce((s, r) => s + Number(r.monto), 0)
  const egresosMes  = (mes ?? []).filter(r => r.tipo === 'egreso').reduce((s, r) => s + Number(r.monto), 0)
  const ingresosHoy = (hoy ?? []).filter(r => r.tipo === 'ingreso').reduce((s, r) => s + Number(r.monto), 0)

  return { ingresosMes, egresosMes, balanceMes: ingresosMes - egresosMes, ingresosHoy }
}

export async function registerMovement(formData: FormData): Promise<void> {
  const shop = await getMyShop()
  if (!shop) return
  const admin = createAdminClient()

  const barberId = (formData.get('barber_id') as string) || null

  await admin.from('cash_movements').insert({
    shop_id: shop.id,
    tipo: formData.get('tipo') as string,
    categoria: formData.get('categoria') as string,
    descripcion: (formData.get('descripcion') as string) || null,
    monto: parseFloat(formData.get('monto') as string),
    metodo_pago: formData.get('metodo_pago') as string,
    barber_id: barberId,
    fecha: new Date().toISOString(),
  })
  revalidatePath('/caja')
  revalidatePath('/admin/reportes')
}

export async function deleteMovement(id: string): Promise<void> {
  const shop = await getMyShop()
  if (!shop) return
  const admin = createAdminClient()
  await admin.from('cash_movements').delete().eq('id', id).eq('shop_id', shop.id)
  revalidatePath('/caja')
}
