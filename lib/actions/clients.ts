'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getMyShop } from './shop'
import { sendBienvenida } from '@/lib/email/sender'
import type { ClientWithCard } from '@/lib/types'

export async function searchClients(query: string) {
  if (!query || query.trim().length < 2) return []
  const shop = await getMyShop()
  if (!shop) return []

  const admin = createAdminClient()
  const { data } = await admin
    .from('clients')
    .select('*')
    .eq('shop_id', shop.id)
    .or(`dni_ce.ilike.%${query.trim()}%,nombre.ilike.%${query.trim()}%`)
    .order('nombre')
    .limit(10)

  return data ?? []
}

export async function getVisitHistory(clientId: string) {
  const shop = await getMyShop()
  if (!shop) return []

  const admin = createAdminClient()
  const { data } = await admin
    .from('visits')
    .select('id, fecha, premio_aplicado')
    .eq('client_id', clientId)
    .eq('shop_id', shop.id)
    .order('fecha', { ascending: false })
    .limit(20)

  return data ?? []
}

export async function getClientWithCard(id: string): Promise<ClientWithCard | null> {
  const shop = await getMyShop()
  if (!shop) return null

  const admin = createAdminClient()
  const { data: client } = await admin
    .from('clients').select('*').eq('id', id).eq('shop_id', shop.id).single()
  if (!client) return null

  const { data: card } = await admin
    .from('loyalty_cards').select('*').eq('client_id', id).single()
  if (!card) return null

  const nextTarjeta = card.tarjetas_completas + 1
  const { data: reward } = await admin.from('rewards_config')
    .select('premio_texto').eq('shop_id', shop.id)
    .eq('tarjeta_num', nextTarjeta).eq('activo', true).single()

  let nextPremio = reward?.premio_texto ?? null
  if (!nextPremio) {
    const { data: def } = await admin.from('rewards_config')
      .select('premio_texto').eq('shop_id', shop.id)
      .eq('es_default', true).eq('activo', true).single()
    nextPremio = def?.premio_texto ?? null
  }

  return { ...client, card, nextPremio }
}

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()
  const shop = await getMyShop()
  if (!shop) return { error: 'No autorizado.' }

  const dni    = (formData.get('dni_ce') as string).trim()
  const nombre = (formData.get('nombre') as string).trim()
  const email  = (formData.get('email') as string).trim()
  const tel    = (formData.get('telefono') as string | null)?.trim() || null

  const { data: client, error } = await supabase.from('clients')
    .insert({ shop_id: shop.id, dni_ce: dni, nombre, email, telefono: tel })
    .select('id').single()

  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un cliente con ese DNI/CE.' }
    return { error: error.message }
  }

  await supabase.from('loyalty_cards').insert({ shop_id: shop.id, client_id: client.id })

  // Buscar primer premio para el email
  const { data: reward } = await supabase.from('rewards_config')
    .select('premio_texto').eq('shop_id', shop.id).eq('tarjeta_num', 1).eq('activo', true).single()
  const { data: def } = await supabase.from('rewards_config')
    .select('premio_texto').eq('shop_id', shop.id).eq('es_default', true).eq('activo', true).single()
  const nextPremio = reward?.premio_texto ?? def?.premio_texto ?? null

  await sendBienvenida(email, nombre, shop.nombre, nextPremio)

  redirect(`/clientes/${client.id}`)
}
