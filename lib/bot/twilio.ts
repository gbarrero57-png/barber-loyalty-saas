/**
 * Twilio helper compartido para bot y recordatorios
 */
export async function sendTwilioWhatsApp(
  toPhone: string,  // +51987654321
  fromNumber: string, // +13186683828
  body: string,
): Promise<{ ok: boolean; sid?: string; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken  = process.env.TWILIO_AUTH_TOKEN
  if (!accountSid || !authToken) return { ok: false, error: 'Twilio no configurado' }

  const to   = toPhone.startsWith('whatsapp:') ? toPhone : `whatsapp:${toPhone}`
  const from = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
  const creds = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
  })

  const json = await res.json() as any
  if (!res.ok) return { ok: false, error: json.message ?? 'Error Twilio' }
  return { ok: true, sid: json.sid }
}
