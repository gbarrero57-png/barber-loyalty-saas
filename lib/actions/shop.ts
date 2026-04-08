'use server'

import { createClient } from '@/lib/supabase/server'
import type { Shop } from '@/lib/types'

export async function getMyShop(): Promise<Shop | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('shops')
    .select('*, shop_users!inner(user_id)')
    .eq('shop_users.user_id', user.id)
    .single()

  return data ?? null
}

export async function updateShop(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const shop = await getMyShop()
  if (!shop) return

  await supabase.from('shops').update({
    nombre:         formData.get('nombre') as string,
    color_primario: formData.get('color_primario') as string || '#1a1a2e',
    telefono:       formData.get('telefono') as string || null,
    direccion:      formData.get('direccion') as string || null,
  }).eq('id', shop.id)
}
