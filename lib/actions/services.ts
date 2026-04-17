'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getMyShop } from '@/lib/actions/shop'
import { revalidatePath } from 'next/cache'

export async function getServices() {
  const shop = await getMyShop()
  if (!shop) return []
  const admin = createAdminClient()
  const { data } = await admin
    .from('services')
    .select('*')
    .eq('shop_id', shop.id)
    .order('nombre')
  return data ?? []
}

export async function createService(formData: FormData): Promise<void> {
  const shop = await getMyShop()
  if (!shop) return
  const admin = createAdminClient()
  await admin.from('services').insert({
    shop_id: shop.id,
    nombre: formData.get('nombre') as string,
    descripcion: (formData.get('descripcion') as string) || null,
    precio: parseFloat(formData.get('precio') as string) || 0,
    duracion_min: parseInt(formData.get('duracion_min') as string) || 30,
  })
  revalidatePath('/admin/servicios')
}

export async function updateService(formData: FormData): Promise<void> {
  const shop = await getMyShop()
  if (!shop) return
  const id = formData.get('id') as string
  const admin = createAdminClient()
  await admin
    .from('services')
    .update({
      nombre: formData.get('nombre') as string,
      descripcion: (formData.get('descripcion') as string) || null,
      precio: parseFloat(formData.get('precio') as string) || 0,
      duracion_min: parseInt(formData.get('duracion_min') as string) || 30,
    })
    .eq('id', id)
    .eq('shop_id', shop.id)
  revalidatePath('/admin/servicios')
}

export async function toggleServiceActive(id: string, activo: boolean) {
  const shop = await getMyShop()
  if (!shop) return
  const admin = createAdminClient()
  await admin.from('services').update({ activo }).eq('id', id).eq('shop_id', shop.id)
  revalidatePath('/admin/servicios')
}

export async function deleteService(id: string) {
  const shop = await getMyShop()
  if (!shop) return
  const admin = createAdminClient()
  await admin.from('services').delete().eq('id', id).eq('shop_id', shop.id)
  revalidatePath('/admin/servicios')
}
