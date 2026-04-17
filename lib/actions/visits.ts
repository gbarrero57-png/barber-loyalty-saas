'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getMyShop } from './shop'
import {
  sendSelloRegistrado, sendPremioDesbloqueado, sendPremioCanjado
} from '@/lib/email/sender'
import {
  waSelloRegistrado, waPremioDesbloqueado, waPremioCanjado
} from '@/lib/whatsapp'

async function getNextPremio(supabase: Awaited<ReturnType<typeof createClient>>, shopId: string, tarjetaNum: number) {
  const { data: r } = await supabase.from('rewards_config')
    .select('premio_texto').eq('shop_id', shopId).eq('tarjeta_num', tarjetaNum).eq('activo', true).single()
  if (r) return r.premio_texto
  const { data: d } = await supabase.from('rewards_config')
    .select('premio_texto').eq('shop_id', shopId).eq('es_default', true).eq('activo', true).single()
  return d?.premio_texto ?? null
}

export async function registerVisit(clientId: string) {
  const supabase = await createClient()
  const shop = await getMyShop()
  if (!shop) return { error: 'No autorizado.' }

  const [{ data: card }, { data: client }] = await Promise.all([
    supabase.from('loyalty_cards').select('*').eq('client_id', clientId).single(),
    supabase.from('clients').select('nombre,email,telefono').eq('id', clientId).single(),
  ])

  if (!card || !client) return { error: 'Cliente no encontrado.' }
  if (card.premio_pendiente) return { error: 'El cliente tiene un premio pendiente de canjear.' }

  const nuevas = card.visitas_actuales + 1
  const completa = nuevas >= 10

  let premioTexto: string | null = null
  let nextPremio: string | null = null

  if (completa) {
    premioTexto = await getNextPremio(supabase, shop.id, card.tarjetas_completas + 1)
  } else {
    nextPremio = await getNextPremio(supabase, shop.id, card.tarjetas_completas + 1)
  }

  await supabase.from('loyalty_cards').update({
    visitas_actuales: completa ? 10 : nuevas,
    premio_pendiente: completa,
    premio_texto: completa ? premioTexto : card.premio_texto,
  }).eq('client_id', clientId)

  await supabase.from('visits').insert({ shop_id: shop.id, client_id: clientId })

  const isPhase2 = shop.subscription_plan === 'phase2' && shop.whatsapp_enabled
  const tel = (client as any).telefono as string | null

  if (completa && premioTexto) {
    await sendPremioDesbloqueado(client.email, client.nombre, shop.nombre, premioTexto, card.tarjetas_completas + 1)
    if (isPhase2 && tel) {
      await waPremioDesbloqueado(tel, client.nombre, shop.nombre, premioTexto)
    }
  } else {
    await sendSelloRegistrado(client.email, client.nombre, shop.nombre, nuevas, nextPremio)
    if (isPhase2 && tel) {
      await waSelloRegistrado(tel, client.nombre, shop.nombre, nuevas, nextPremio)
    }
  }

  revalidatePath(`/clientes/${clientId}`)
  return { success: true, tarjetaCompleta: completa, premioTexto }
}

export async function redeemPrize(clientId: string) {
  const supabase = await createClient()
  const shop = await getMyShop()
  if (!shop) return { error: 'No autorizado.' }

  const [{ data: card }, { data: client }] = await Promise.all([
    supabase.from('loyalty_cards').select('*').eq('client_id', clientId).single(),
    supabase.from('clients').select('nombre,email,telefono').eq('id', clientId).single(),
  ])

  if (!card || !client) return { error: 'No encontrado.' }
  if (!card.premio_pendiente) return { error: 'No hay premio pendiente.' }

  const premioCanjeado = card.premio_texto ?? ''
  const nuevaTarjetaNum = card.tarjetas_completas + 1

  await supabase.from('loyalty_cards').update({
    visitas_actuales: 0,
    tarjetas_completas: nuevaTarjetaNum,
    premio_pendiente: false,
    premio_texto: null,
  }).eq('client_id', clientId)

  await supabase.from('visits').insert({
    shop_id: shop.id, client_id: clientId, premio_aplicado: premioCanjeado
  })

  const nextPremio = await getNextPremio(supabase, shop.id, nuevaTarjetaNum + 1)
  await sendPremioCanjado(client.email, client.nombre, shop.nombre, premioCanjeado, nuevaTarjetaNum, nextPremio)

  const isPhase2 = shop.subscription_plan === 'phase2' && shop.whatsapp_enabled
  const tel = (client as any).telefono as string | null
  if (isPhase2 && tel) {
    await waPremioCanjado(tel, client.nombre, shop.nombre, premioCanjeado)
  }

  revalidatePath(`/clientes/${clientId}`)
  return { success: true }
}
