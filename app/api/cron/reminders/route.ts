/**
 * Vercel Cron Job — Recordatorios WhatsApp 24h antes de la cita
 * Schedule: cada hora (ver vercel.json)
 * Envía un WhatsApp a clientes con cita en las próximas 24h-25h
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTwilioWhatsApp } from '@/lib/bot/twilio'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  // Verificar cron secret
  const auth = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (!secret) return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const now = new Date()

  // Ventana: entre 23h y 25h desde ahora
  const from = new Date(now.getTime() + 23 * 3600000)
  const to   = new Date(now.getTime() + 25 * 3600000)

  const { data: appointments } = await admin
    .from('appointments')
    .select('id, shop_id, client_nombre, client_tel, fecha_inicio, services(nombre), barbers(nombre), shops(nombre, bot_twilio_number, bot_enabled, whatsapp_enabled)')
    .gte('fecha_inicio', from.toISOString())
    .lte('fecha_inicio', to.toISOString())
    .in('estado', ['pendiente', 'confirmado'])

  if (!appointments?.length) {
    return NextResponse.json({ sent: 0, message: 'No hay citas próximas' })
  }

  let sent = 0
  let failed = 0

  for (const appt of appointments) {
    const shop = appt.shops as any
    if (!shop?.bot_enabled || !shop?.whatsapp_enabled) continue
    if (!appt.client_tel) continue

    // Verificar que la barbería sea Phase 2
    const { data: sub } = await admin
      .from('subscriptions')
      .select('plan, status')
      .eq('shop_id', appt.shop_id)
      .single()

    if (sub?.plan !== 'phase2' || sub?.status === 'paused' || sub?.status === 'cancelled') continue

    const dt = new Date(appt.fecha_inicio)
    const fechaStr = dt.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })
    const horaStr = dt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    const servicio = (appt.services as any)?.nombre ?? 'tu cita'
    const barbero = (appt.barbers as any)?.nombre

    const msg =
      `📅 *Recordatorio — ${shop.nombre}*\n\n` +
      `Hola ${appt.client_nombre?.replace('Cliente WhatsApp +', '') || 'estimado cliente'}! ` +
      `Te recordamos que mañana tienes una cita:\n\n` +
      `✂️ ${servicio}${barbero ? ` con *${barbero}*` : ''}\n` +
      `⏰ ${fechaStr} a las ${horaStr}\n\n` +
      `📍 ${shop.nombre}\n\n` +
      `_Si no puedes asistir, contáctanos con anticipación._`

    const phone = `+${appt.client_tel.replace(/\D/g, '')}`
    const from = shop.bot_twilio_number ?? process.env.TWILIO_SMS_FROM ?? ''

    const result = await sendTwilioWhatsApp(phone, from, msg)
    if (result.ok) sent++
    else failed++
  }

  return NextResponse.json({ sent, failed, checked: appointments.length })
}
