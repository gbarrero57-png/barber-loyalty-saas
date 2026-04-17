'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getMyShop } from '@/lib/actions/shop'
import { revalidatePath } from 'next/cache'


export async function getSchedules(barberId?: string | null) {
  const shop = await getMyShop()
  if (!shop) return []
  const admin = createAdminClient()

  let query = admin
    .from('barber_schedules')
    .select('*')
    .eq('shop_id', shop.id)
    .order('dia_semana')

  if (barberId === null) query = query.is('barber_id', null)
  else if (barberId) query = query.eq('barber_id', barberId)

  const { data } = await query
  return data ?? []
}

export async function upsertSchedule(formData: FormData): Promise<void> {
  const shop = await getMyShop()
  if (!shop) return
  const admin = createAdminClient()

  const barberId = (formData.get('barber_id') as string) || null
  const dia = parseInt(formData.get('dia_semana') as string)
  const horaInicio = formData.get('hora_inicio') as string
  const horaFin = formData.get('hora_fin') as string
  const activo = formData.get('activo') !== 'false'

  // Buscar existente manualmente (NULL no funciona bien con upsert onConflict)
  let existQuery = admin
    .from('barber_schedules')
    .select('id')
    .eq('shop_id', shop.id)
    .eq('dia_semana', dia)

  if (barberId) existQuery = existQuery.eq('barber_id', barberId)
  else existQuery = existQuery.is('barber_id', null)

  const { data: existing } = await existQuery.single()

  if (existing?.id) {
    await admin.from('barber_schedules')
      .update({ hora_inicio: horaInicio, hora_fin: horaFin, activo })
      .eq('id', existing.id)
  } else {
    await admin.from('barber_schedules').insert({
      shop_id: shop.id, barber_id: barberId, dia_semana: dia,
      hora_inicio: horaInicio, hora_fin: horaFin, activo,
    })
  }

  revalidatePath('/admin/horarios')
}

export async function deleteSchedule(id: string): Promise<void> {
  const shop = await getMyShop()
  if (!shop) return
  const admin = createAdminClient()
  await admin.from('barber_schedules').delete().eq('id', id).eq('shop_id', shop.id)
  revalidatePath('/admin/horarios')
}

