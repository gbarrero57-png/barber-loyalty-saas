'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Shop } from '@/lib/types'

export async function getMyShop(): Promise<Shop | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data } = await admin
    .from('shop_users')
    .select('shop_id, shops(*, subscriptions(plan, status))')
    .eq('user_id', user.id)
    .single()

  if (!data?.shops) return null
  const shop = data.shops as any
  const sub = Array.isArray(shop.subscriptions) ? shop.subscriptions[0] : shop.subscriptions

  return {
    ...shop,
    subscription_plan: sub?.plan ?? null,
    subscription_status: sub?.status ?? null,
  } as Shop
}

export async function updateShop(formData: FormData): Promise<void> {
  const shop = await getMyShop()
  if (!shop) return

  const admin = createAdminClient()
  await admin.from('shops').update({
    nombre:         formData.get('nombre') as string,
    color_primario: formData.get('color_primario') as string || '#1a1a2e',
    telefono:       formData.get('telefono') as string || null,
    direccion:      formData.get('direccion') as string || null,
  }).eq('id', shop.id)
}

export async function toggleWhatsapp(formData: FormData): Promise<void> {
  const shop = await getMyShop()
  if (!shop) return

  const admin = createAdminClient()
  await admin.from('shops').update({
    whatsapp_enabled: formData.get('whatsapp_enabled') === 'true',
  }).eq('id', shop.id)

  const { revalidatePath } = await import('next/cache')
  revalidatePath('/admin/configuracion')
}
