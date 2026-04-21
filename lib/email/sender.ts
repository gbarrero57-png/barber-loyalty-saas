import nodemailer from 'nodemailer'

function getTransporter() {
  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_KEY,
    },
  })
}

const FROM = process.env.EMAIL_FROM ?? '"Barber Loyalty" <gabriel@redsolucionesti.com>'

async function send(to: string, subject: string, html: string) {
  if (!process.env.BREVO_SMTP_KEY) {
    console.warn('[email] BREVO_SMTP_KEY no configurada — omitido')
    return
  }
  try {
    await getTransporter().sendMail({ from: FROM, to, subject, html })
  } catch (err) {
    console.error('[email] Error al enviar a', to, err)
  }
}

// ── 1. Bienvenida ────────────────────────────────────────────
export async function sendBienvenida(
  to: string, nombre: string, shopNombre: string, nextPremio: string | null
) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
      <div style="background:#1a1a1a;padding:28px;text-align:center">
        <h1 style="color:#FFD700;margin:0;font-size:22px">✂️ ${shopNombre}</h1>
        <p style="color:#aaa;font-size:12px;margin:4px 0 0">Programa de Fidelidad</p>
      </div>
      <div style="padding:28px;background:#fff">
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>¡Ya eres parte del programa de fidelidad de <strong>${shopNombre}</strong>! 🎉</p>
        <div style="background:#f9f9f9;border:2px dashed #FFD700;border-radius:10px;padding:18px;text-align:center;margin:20px 0">
          <p style="font-weight:bold;margin:0 0 10px">Tu tarjeta comienza hoy</p>
          <p style="font-size:28px;letter-spacing:4px;margin:0">○ ○ ○ ○ ○ ○ ○ ○ ○ ○</p>
          <p style="font-size:12px;color:#888;margin:8px 0 0">0/10 visitas</p>
        </div>
        ${nextPremio ? `<p>🎁 Tu próximo premio al completar la tarjeta: <strong>${nextPremio}</strong></p>` : ''}
        <p style="font-size:12px;color:#888">Cada visita acerca más tu premio. ¡Nos vemos pronto!</p>
      </div>
    </div>`
  await send(to, `✂️ ¡Bienvenido/a a ${shopNombre}!`, html)
}

// ── 2. Sello registrado ──────────────────────────────────────
export async function sendSelloRegistrado(
  to: string, nombre: string, shopNombre: string,
  visitas: number, nextPremio: string | null
) {
  const sellos = Array.from({ length: 10 }, (_, i) =>
    i < visitas ? '✂' : '○'
  ).join(' ')
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
      <div style="background:#1a1a1a;padding:28px;text-align:center">
        <h1 style="color:#FFD700;margin:0;font-size:22px">✂️ ${shopNombre}</h1>
      </div>
      <div style="padding:28px;background:#fff">
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>¡Nuevo sello registrado! Llevas <strong>${visitas}/10</strong> visitas.</p>
        <div style="background:#f9f9f9;border:2px dashed #FFD700;border-radius:10px;padding:18px;text-align:center;margin:20px 0">
          <p style="font-size:22px;letter-spacing:3px;margin:0">${sellos}</p>
          <p style="font-size:12px;color:#888;margin:8px 0 0">${visitas}/10 visitas — faltan ${10 - visitas}</p>
        </div>
        ${nextPremio ? `<p>🎁 Premio al completar: <strong>${nextPremio}</strong></p>` : ''}
      </div>
    </div>`
  await send(to, `✂️ ¡Sello #${visitas}! Llevas ${visitas}/10 — ${shopNombre}`, html)
}

// ── 3. Premio desbloqueado ───────────────────────────────────
export async function sendPremioDesbloqueado(
  to: string, nombre: string, shopNombre: string,
  premioTexto: string, tarjetasCompletas: number
) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
      <div style="background:#1a1a1a;padding:28px;text-align:center">
        <h1 style="color:#FFD700;margin:0;font-size:22px">✂️ ${shopNombre}</h1>
      </div>
      <div style="padding:28px;background:#fff;text-align:center">
        <p style="font-size:48px;margin:0">🎉</p>
        <h2>¡Felicidades ${nombre}!</h2>
        <p>Completaste tu tarjeta #${tarjetasCompletas} y ganaste:</p>
        <div style="background:#FFD700;border-radius:10px;padding:16px;margin:20px 0">
          <p style="font-size:20px;font-weight:bold;margin:0;color:#1a1a1a">${premioTexto}</p>
        </div>
        <p style="font-size:13px;color:#888">Muéstrale este email al barbero para canjear tu premio.</p>
      </div>
    </div>`
  await send(to, `🎉 ¡Ganaste un premio en ${shopNombre}!`, html)
}

// ── 5. Recibo de pago ────────────────────────────────────────
export async function sendReciboPago(
  to: string, nombre: string, shopNombre: string,
  concepto: string, monto: number, chargeId: string,
) {
  const fecha = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
  const montoStr = `S/ ${monto.toFixed(2)}`
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
      <div style="background:#1a1a1a;padding:28px;text-align:center">
        <h1 style="color:#FFD700;margin:0;font-size:22px">✂️ ${shopNombre}</h1>
        <p style="color:#aaa;font-size:12px;margin:4px 0 0">Comprobante de Pago</p>
      </div>
      <div style="padding:28px;background:#fff">
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Tu pago fue procesado exitosamente. Aquí está tu comprobante:</p>
        <div style="border:1px solid #e5e5e5;border-radius:10px;overflow:hidden;margin:20px 0">
          <div style="background:#f9f9f9;padding:14px 18px;border-bottom:1px solid #e5e5e5">
            <p style="margin:0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.05em">Detalle</p>
          </div>
          <div style="padding:18px">
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:6px 0;color:#555">Servicio</td><td style="padding:6px 0;text-align:right;font-weight:600">${concepto}</td></tr>
              <tr><td style="padding:6px 0;color:#555">Fecha</td><td style="padding:6px 0;text-align:right">${fecha}</td></tr>
              <tr style="border-top:1px solid #e5e5e5">
                <td style="padding:12px 0 6px;font-weight:700;font-size:16px">Total</td>
                <td style="padding:12px 0 6px;text-align:right;font-weight:900;font-size:18px;color:#1a1a1a">${montoStr}</td>
              </tr>
            </table>
          </div>
        </div>
        <p style="font-size:11px;color:#aaa;margin-top:20px">ID de transacción: <code>${chargeId}</code></p>
        <p style="font-size:12px;color:#888">Gracias por tu preferencia. ¡Hasta la próxima!</p>
      </div>
    </div>`
  await send(to, `✅ Comprobante de pago — ${shopNombre}`, html)
}

// ── 4. Premio canjeado ───────────────────────────────────────
export async function sendPremioCanjado(
  to: string, nombre: string, shopNombre: string,
  premioCanjeado: string, nuevaTarjetaNum: number, nextPremio: string | null
) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
      <div style="background:#1a1a1a;padding:28px;text-align:center">
        <h1 style="color:#FFD700;margin:0;font-size:22px">✂️ ${shopNombre}</h1>
      </div>
      <div style="padding:28px;background:#fff">
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>✅ Premio canjeado: <strong>${premioCanjeado}</strong></p>
        <p>Tu tarjeta #${nuevaTarjetaNum} comienza hoy. ¡Sigue acumulando!</p>
        ${nextPremio ? `<p>🎁 Próximo premio: <strong>${nextPremio}</strong></p>` : ''}
      </div>
    </div>`
  await send(to, `✅ Premio canjeado — tarjeta #${nuevaTarjetaNum} comienza — ${shopNombre}`, html)
}
