/**
 * Twilio WhatsApp / SMS notifications
 * Reusable for Phase 2 barberías
 *
 * Env vars required:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_WHATSAPP_FROM   → whatsapp:+13186683828
 *   TWILIO_SMS_FROM        → +13186683828  (fallback SMS)
 */

type WaResult = { ok: boolean; sid?: string; error?: string }

async function sendTwilioMessage(to: string, from: string, body: string): Promise<WaResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken  = process.env.TWILIO_AUTH_TOKEN
  if (!accountSid || !authToken) return { ok: false, error: 'Twilio no configurado' }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
  const creds = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
  })

  const json = await res.json() as any
  if (!res.ok) return { ok: false, error: json.message ?? 'Error Twilio' }
  return { ok: true, sid: json.sid }
}

/**
 * Normaliza teléfono peruano a formato E.164
 * "987654321" → "+51987654321"
 * "+51987654321" → "+51987654321"
 */
function normalizePhone(tel: string): string {
  const cleaned = tel.replace(/\D/g, '')
  if (cleaned.startsWith('51') && cleaned.length === 11) return `+${cleaned}`
  if (cleaned.length === 9) return `+51${cleaned}`
  return `+${cleaned}`
}

function getWhatsAppFrom(): string {
  return process.env.TWILIO_WHATSAPP_FROM ?? 'whatsapp:+13186683828'
}

function getSmsFrom(): string {
  return process.env.TWILIO_SMS_FROM ?? '+13186683828'
}

// ── Mensaje: sello registrado ──────────────────────────────────────────────
export async function waSelloRegistrado(
  telefono: string,
  nombreCliente: string,
  nombreBarberia: string,
  sellosActuales: number,
  premioProximo: string | null,
): Promise<WaResult> {
  if (!telefono) return { ok: false, error: 'Sin teléfono' }
  const to = `whatsapp:${normalizePhone(telefono)}`
  const from = getWhatsAppFrom()
  const sellosRestantes = 10 - sellosActuales
  const premioLine = premioProximo ? `\nPróximo premio: *${premioProximo}*` : ''

  const body =
    `✂️ *${nombreBarberia}*\n` +
    `Hola ${nombreCliente}, registramos tu visita 💈\n` +
    `Llevas *${sellosActuales}/10* sellos. Faltan *${sellosRestantes}* para tu premio.` +
    premioLine

  return sendTwilioMessage(to, from, body)
}

// ── Mensaje: premio desbloqueado ───────────────────────────────────────────
export async function waPremioDesbloqueado(
  telefono: string,
  nombreCliente: string,
  nombreBarberia: string,
  premioTexto: string,
): Promise<WaResult> {
  if (!telefono) return { ok: false, error: 'Sin teléfono' }
  const to = `whatsapp:${normalizePhone(telefono)}`
  const from = getWhatsAppFrom()

  const body =
    `🏆 *${nombreBarberia}*\n` +
    `¡Felicidades ${nombreCliente}! Completaste tu tarjeta 🎉\n` +
    `Premio desbloqueado: *${premioTexto}*\n` +
    `Preséntate en la barbería para canjearlo.`

  return sendTwilioMessage(to, from, body)
}

// ── Mensaje: premio canjeado ───────────────────────────────────────────────
export async function waPremioCanjado(
  telefono: string,
  nombreCliente: string,
  nombreBarberia: string,
  premioCanjeado: string,
): Promise<WaResult> {
  if (!telefono) return { ok: false, error: 'Sin teléfono' }
  const to = `whatsapp:${normalizePhone(telefono)}`
  const from = getWhatsAppFrom()

  const body =
    `✅ *${nombreBarberia}*\n` +
    `Premio canjeado: *${premioCanjeado}* 🎁\n` +
    `Tu nueva tarjeta ya empezó. ¡Hasta pronto, ${nombreCliente}!`

  return sendTwilioMessage(to, from, body)
}

// ── SMS fallback (sin WhatsApp) ────────────────────────────────────────────
export async function smsSelloRegistrado(
  telefono: string,
  nombreBarberia: string,
  sellosActuales: number,
): Promise<WaResult> {
  if (!telefono) return { ok: false, error: 'Sin teléfono' }
  const to = normalizePhone(telefono)
  const from = getSmsFrom()
  const body = `${nombreBarberia}: Visita registrada. Llevas ${sellosActuales}/10 sellos 💈`
  return sendTwilioMessage(to, from, body)
}
