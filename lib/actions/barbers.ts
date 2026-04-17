'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getMyShop } from '@/lib/actions/shop'
import { revalidatePath } from 'next/cache'

export async function getBarbers() {
  const shop = await getMyShop()
  if (!shop) return []
  const admin = createAdminClient()
  const { data } = await admin
    .from('barbers')
    .select('*')
    .eq('shop_id', shop.id)
    .order('nombre')
  return data ?? []
}

export async function createBarber(formData: FormData): Promise<void> {
  const shop = await getMyShop()
  if (!shop) return
  const admin = createAdminClient()
  await admin.from('barbers').insert({
    shop_id: shop.id,
    nombre: formData.get('nombre') as string,
    telefono: (formData.get('telefono') as string) || null,
    email: (formData.get('email') as string) || null,
  })
  revalidatePath('/admin/barberos')
}

export async function updateBarber(formData: FormData): Promise<void> {
  const shop = await getMyShop()
  if (!shop) return
  const id = formData.get('id') as string
  const admin = createAdminClient()
  await admin
    .from('barbers')
    .update({
      nombre: formData.get('nombre') as string,
      telefono: (formData.get('telefono') as string) || null,
      email: (formData.get('email') as string) || null,
    })
    .eq('id', id)
    .eq('shop_id', shop.id)
  revalidatePath('/admin/barberos')
}

export async function toggleBarberActive(id: string, activo: boolean) {
  const shop = await getMyShop()
  if (!shop) return
  const admin = createAdminClient()
  await admin.from('barbers').update({ activo }).eq('id', id).eq('shop_id', shop.id)
  revalidatePath('/admin/barberos')
}

export async function deleteBarber(id: string) {
  const shop = await getMyShop()
  if (!shop) return
  const admin = createAdminClient()
  await admin.from('barbers').delete().eq('id', id).eq('shop_id', shop.id)
  revalidatePath('/admin/barberos')
}
