'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getMyShop } from './shop'

export async function saveOnboardingService(formData: FormData) {
  const shop = await getMyShop()
  if (!shop) redirect('/login')
  const admin = createAdminClient()
  await admin.from('services').insert({
    shop_id:      shop.id,
    nombre:       (formData.get('nombre') as string).trim(),
    precio:       parseFloat(formData.get('precio') as string) || 0,
    duracion_min: parseInt(formData.get('duracion_min') as string) || 30,
    activo:       true,
  })
}

export async function saveOnboardingBarber(formData: FormData) {
  const shop = await getMyShop()
  if (!shop) redirect('/login')
  const nombre = (formData.get('nombre') as string).trim()
  if (!nombre) return
  const admin = createAdminClient()
  await admin.from('barbers').insert({
    shop_id:  shop.id,
    nombre,
    telefono: (formData.get('telefono') as string).trim() || null,
    activo:   true,
  })
}

export async function completeOnboarding() {
  const shop = await getMyShop()
  if (!shop) redirect('/login')
  const admin = createAdminClient()
  await admin.from('shops').update({ onboarding_done: true }).eq('id', shop.id)
  redirect('/home')
}
