'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getMyShop } from '@/lib/actions/shop'
import { revalidatePath } from 'next/cache'

export async function getAppointments(fecha?: string) {
  const shop = await getMyShop()
  if (!shop) return []
  const admin = createAdminClient()

  // Default: hoy
  const day = fecha ? new Date(fecha) : new Date()
  const start = new Date(day)
  start.setHours(0, 0, 0, 0)
  const end = new Date(day)
  end.setHours(23, 59, 59, 999)

  const { data } = await admin
    .from('appointments')
    .select('*, barbers(nombre), services(nombre, precio)')
    .eq('shop_id', shop.id)
    .gte('fecha_inicio', start.toISOString())
    .lte('fecha_inicio', end.toISOString())
    .order('fecha_inicio')

  return data ?? []
}

export async function getUpcomingAppointments() {
  const shop = await getMyShop()
  if (!shop) return []
  const admin = createAdminClient()
  const { data } = await admin
    .from('appointments')
    .select('*, barbers(nombre), services(nombre, precio)')
    .eq('shop_id', shop.id)
    .gte('fecha_inicio', new Date().toISOString())
    .in('estado', ['pendiente', 'confirmado'])
    .order('fecha_inicio')
    .limit(20)
  return data ?? []
}

export async function createAppointment(formData: FormData): Promise<void> {
  const shop = await getMyShop()
  if (!shop) return
  const admin = createAdminClient()

  const fechaInicio = new Date(formData.get('fecha_inicio') as string)
  const durMin = parseInt(formData.get('duracion_min') as string) || 30
  const fechaFin = new Date(fechaInicio.getTime() + durMin * 60000)

  const serviceId = (formData.get('service_id') as string) || null
  const barberId = (formData.get('barber_id') as string) || null

  let precio: number | null = null
  if (serviceId) {
    const { data: svc } = await admin.from('services').select('precio').eq('id', serviceId).single()
    precio = svc?.precio ?? null
  }

  await admin.from('appointments').insert({
    shop_id: shop.id,
    barber_id: barberId,
    service_id: serviceId,
    client_nombre: formData.get('client_nombre') as string,
    client_tel: (formData.get('client_tel') as string) || null,
    fecha_inicio: fechaInicio.toISOString(),
    fecha_fin: fechaFin.toISOString(),
    notas: (formData.get('notas') as string) || null,
    precio,
  })
  revalidatePath('/citas')
}

export async function updateAppointmentEstado(id: string, estado: string) {
  const shop = await getMyShop()
  if (!shop) return
  const admin = createAdminClient()
  await admin.from('appointments').update({ estado }).eq('id', id).eq('shop_id', shop.id)
  revalidatePath('/citas')
}

export async function deleteAppointment(id: string) {
  const shop = await getMyShop()
  if (!shop) return
  const admin = createAdminClient()
  await admin.from('appointments').delete().eq('id', id).eq('shop_id', shop.id)
  revalidatePath('/citas')
}
