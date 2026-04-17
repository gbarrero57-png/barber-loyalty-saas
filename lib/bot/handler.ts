/**
 * Bot WhatsApp — Máquina de estados para agendamiento de citas
 * Estados: menu → sel_service → sel_barber → sel_fecha → sel_hora → confirm
 */
import { createAdminClient } from '@/lib/supabase/admin'
import { getAvailableSlots, formatFechaES } from './slots'

type BotState = 'menu' | 'sel_service' | 'sel_barber' | 'sel_fecha' | 'sel_hora' | 'confirm' | 'mis_citas'

interface SessionData {
  service_id?: string
  service_name?: string
  service_duracion?: number
  service_precio?: number
  barber_id?: string | null  // null = cualquiera
  barber_name?: string
  fecha?: string             // YYYY-MM-DD
  slot_hora?: string         // HH:MM
  client_nombre?: string
  // opciones del paso actual para validar selección
  opciones?: string[]
}

interface Session {
  state: BotState
  data: SessionData
}

// ── helpers ────────────────────────────────────────────────────────────────

async function getSession(admin: any, phone: string, shopId: string): Promise<Session> {
  const { data } = await admin
    .from('bot_sessions')
    .select('state, data')
    .eq('phone', phone)
    .eq('shop_id', shopId)
    .single()
  return data ?? { state: 'menu' as BotState, data: {} }
}

async function saveSession(admin: any, phone: string, shopId: string, session: Session) {
  await admin.from('bot_sessions').upsert(
    { phone, shop_id: shopId, state: session.state, data: session.data, updated_at: new Date().toISOString() },
    { onConflict: 'phone,shop_id' }
  )
}

function numbered(items: string[]): string {
  return items.map((s, i) => `${i + 1}. ${s}`).join('\n')
}

function parseSelection(input: string, max: number): number | null {
  const n = parseInt(input.trim())
  if (!isNaN(n) && n >= 1 && n <= max) return n
  return null
}

function parseFecha(input: string): string | null {
  const trim = input.trim()
  // DD/MM, DD/MM/YY, DD/MM/YYYY
  const match = trim.match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?$/)
  if (!match) return null
  const d = parseInt(match[1])
  const m = parseInt(match[2])
  let y = match[3] ? parseInt(match[3]) : new Date().getFullYear()
  if (y < 100) y += 2000
  if (m < 1 || m > 12 || d < 1 || d > 31) return null
  const fecha = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  if (new Date(fecha) < new Date(new Date().toDateString())) return null  // pasado
  return fecha
}

// ── mensajes ───────────────────────────────────────────────────────────────

function msgMenu(nombre: string): string {
  return `💈 *${nombre}*\n\n¡Hola! Soy el asistente de citas. ¿En qué te ayudo?\n\n1. Agendar una cita\n2. Mis citas próximas\n3. Cancelar una cita\n\n_Responde con el número de tu opción_`
}

function msgUnknown(): string {
  return `No entendí tu respuesta 😅 Responde con *1*, *2* o *3* para continuar.\n\nEscribe *menú* para volver al inicio.`
}

// ── handler principal ──────────────────────────────────────────────────────

export async function handleBotMessage(
  phone: string,       // whatsapp:+51987654321
  body: string,
  shop: any,
): Promise<string> {
  const admin = createAdminClient()
  const input = body.trim().toLowerCase()

  // Reset con "menú", "menu", "hola", "inicio", "0"
  if (['menu', 'menú', 'hola', 'inicio', '0', 'start'].includes(input)) {
    await saveSession(admin, phone, shop.id, { state: 'menu', data: {} })
    return msgMenu(shop.nombre)
  }

  const session = await getSession(admin, phone, shop.id)

  // ── MENU ──────────────────────────────────────────────────────────────────
  if (session.state === 'menu') {
    const opt = parseSelection(body, 3)
    if (!opt) return msgMenu(shop.nombre)

    if (opt === 1) {
      // Cargar servicios
      const { data: services } = await admin
        .from('services')
        .select('id, nombre, precio, duracion_min')
        .eq('shop_id', shop.id)
        .eq('activo', true)
        .order('nombre')

      if (!services?.length) {
        return `${shop.nombre} aún no tiene servicios configurados. Llama directamente para agendar.`
      }

      const opciones = services.map((s: any) => s.id)
      await saveSession(admin, phone, shop.id, {
        state: 'sel_service',
        data: { opciones },
      })

      const lines = services.map((s: any, i: number) =>
        `${i + 1}. ${s.nombre} — S/${Number(s.precio).toFixed(0)} (${s.duracion_min}min)`
      )
      return `✂️ *Servicios disponibles:*\n\n${lines.join('\n')}\n\n_¿Cuál deseas? Responde con el número_`
    }

    if (opt === 2) {
      // Mis citas próximas
      const cleanPhone = phone.replace('whatsapp:', '').replace('+', '')
      const { data: citas } = await admin
        .from('appointments')
        .select('fecha_inicio, estado, services(nombre), barbers(nombre)')
        .eq('shop_id', shop.id)
        .eq('client_tel', cleanPhone)
        .gte('fecha_inicio', new Date().toISOString())
        .in('estado', ['pendiente', 'confirmado'])
        .order('fecha_inicio')
        .limit(3)

      if (!citas?.length) return `No tienes citas próximas en *${shop.nombre}*.\n\nEscribe *1* para agendar una.`

      const lines = citas.map((c: any) => {
        const dt = new Date(c.fecha_inicio)
        const fecha = dt.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })
        const hora = dt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
        const svc = c.services?.nombre ?? 'Servicio'
        const barb = c.barbers?.nombre ? ` con ${c.barbers.nombre}` : ''
        return `• ${fecha} ${hora} — ${svc}${barb} (${c.estado})`
      })
      await saveSession(admin, phone, shop.id, { state: 'menu', data: {} })
      return `📅 *Tus citas en ${shop.nombre}:*\n\n${lines.join('\n')}\n\nEscribe *menú* para volver.`
    }

    if (opt === 3) {
      await saveSession(admin, phone, shop.id, { state: 'menu', data: {} })
      return `Para cancelar una cita, llama directamente a *${shop.nombre}* o visítanos.\n\n_En una próxima versión podrás cancelar desde aquí._`
    }
  }

  // ── SEL SERVICE ───────────────────────────────────────────────────────────
  if (session.state === 'sel_service') {
    const { opciones = [] } = session.data
    const opt = parseSelection(body, opciones.length)
    if (!opt) return `Responde con un número del 1 al ${opciones.length}.\nEscribe *menú* para volver.`

    const serviceId = opciones[opt - 1]
    const { data: svc } = await admin.from('services').select('*').eq('id', serviceId).single()

    // Cargar barberos
    const { data: barbers } = await admin
      .from('barbers')
      .select('id, nombre')
      .eq('shop_id', shop.id)
      .eq('activo', true)
      .order('nombre')

    const options: string[] = []
    const barberIds: (string | null)[] = []

    if (barbers?.length) {
      barbers.forEach((b: any) => { options.push(b.nombre); barberIds.push(b.id) })
      options.push('Cualquier barbero disponible')
      barberIds.push(null)
    } else {
      options.push('Continuar')
      barberIds.push(null)
    }

    await saveSession(admin, phone, shop.id, {
      state: 'sel_barber',
      data: {
        service_id: svc.id,
        service_name: svc.nombre,
        service_duracion: svc.duracion_min,
        service_precio: svc.precio,
        opciones: barberIds.map(id => id ?? 'null'),
      },
    })

    return `💈 *${svc.nombre}* seleccionado.\n\n¿Con qué barbero?\n\n${numbered(options)}\n\n_Responde con el número_`
  }

  // ── SEL BARBER ────────────────────────────────────────────────────────────
  if (session.state === 'sel_barber') {
    const { opciones = [], service_name, service_duracion, service_precio, service_id } = session.data
    const opt = parseSelection(body, opciones.length)
    if (!opt) return `Responde con un número del 1 al ${opciones.length}.\nEscribe *menú* para volver.`

    const rawId = opciones[opt - 1]
    const barberId = rawId === 'null' ? null : rawId
    let barberName = 'Cualquier barbero'

    if (barberId) {
      const { data: b } = await admin.from('barbers').select('nombre').eq('id', barberId).single()
      barberName = b?.nombre ?? 'Barbero'
    }

    await saveSession(admin, phone, shop.id, {
      state: 'sel_fecha',
      data: { service_id, service_name, service_duracion, service_precio, barber_id: barberId, barber_name: barberName },
    })

    return `📅 *¿Para cuándo deseas la cita?*\n\n1. Hoy\n2. Mañana\n3. Pasado mañana\n\nO escribe la fecha: *DD/MM* o *DD/MM/YYYY*\n\nEscribe *menú* para cancelar.`
  }

  // ── SEL FECHA ─────────────────────────────────────────────────────────────
  if (session.state === 'sel_fecha') {
    const { service_duracion = 30, barber_id, barber_name, service_id, service_name, service_precio } = session.data
    let fecha: string | null = null

    const opt = parseSelection(body, 3)
    if (opt === 1) fecha = new Date().toISOString().slice(0, 10)
    else if (opt === 2) {
      const d = new Date(); d.setDate(d.getDate() + 1)
      fecha = d.toISOString().slice(0, 10)
    } else if (opt === 3) {
      const d = new Date(); d.setDate(d.getDate() + 2)
      fecha = d.toISOString().slice(0, 10)
    } else {
      fecha = parseFecha(body)
    }

    if (!fecha) return `No entendí la fecha 😅 Escribe *DD/MM* (ej: 20/04) o elige 1, 2 o 3.`

    const slots = await getAvailableSlots(shop.id, fecha, barber_id ?? null, service_duracion)

    if (!slots.length) {
      return `No hay horarios disponibles para *${formatFechaES(fecha)}* con ${barberName(barber_name)}.

Intenta con otra fecha o escribe *menú* para volver.`
    }

    const slotsLabels = slots.slice(0, 10).map(s => s.label)
    const slotsHoras  = slots.slice(0, 10).map(s => s.hora)

    await saveSession(admin, phone, shop.id, {
      state: 'sel_hora',
      data: { service_id, service_name, service_duracion, service_precio, barber_id, barber_name, fecha, opciones: slotsHoras },
    })

    return `⏰ *Horarios disponibles — ${formatFechaES(fecha)}:*\n\n${numbered(slotsLabels)}\n\n_Responde con el número del horario_`
  }

  // ── SEL HORA ──────────────────────────────────────────────────────────────
  if (session.state === 'sel_hora') {
    const { opciones = [], service_id, service_name, service_duracion, service_precio, barber_id, barber_name, fecha } = session.data
    const opt = parseSelection(body, opciones.length)
    if (!opt) return `Responde con un número del 1 al ${opciones.length}.\nEscribe *menú* para volver.`

    const hora = opciones[opt - 1]

    await saveSession(admin, phone, shop.id, {
      state: 'confirm',
      data: { service_id, service_name, service_duracion, service_precio, barber_id, barber_name, fecha, slot_hora: hora },
    })

    const fechaLabel = formatFechaES(fecha!)
    const barberLabel = barber_id ? `con *${barber_name}*` : 'con cualquier barbero disponible'
    const precioLabel = service_precio ? ` · S/${Number(service_precio).toFixed(0)}` : ''

    return `📋 *Resumen de tu cita:*\n\n✂️ Servicio: *${service_name}*${precioLabel}\n💈 Barbero: ${barberLabel}\n📅 Fecha: *${fechaLabel}*\n⏰ Hora: *${horaLabel(hora)}*\n\n¿Confirmamos? Responde *SÍ* para confirmar o *NO* para cancelar.`
  }

  // ── CONFIRM ───────────────────────────────────────────────────────────────
  if (session.state === 'confirm') {
    const resp = input.replace(/[áéíóú]/g, c => ({'á':'a','é':'e','í':'i','ó':'o','ú':'u'}[c] ?? c))

    if (['si', 'sí', 's', 'yes', 'y', '1', 'confirmar', 'ok'].includes(resp)) {
      const { service_id, service_duracion = 30, service_precio, barber_id, fecha, slot_hora, service_name } = session.data

      const fechaInicio = new Date(`${fecha}T${slot_hora}:00`)
      const fechaFin = new Date(fechaInicio.getTime() + service_duracion * 60000)
      const cleanPhone = phone.replace('whatsapp:', '').replace('+', '')

      const { error } = await admin.from('appointments').insert({
        shop_id: shop.id,
        barber_id: barber_id ?? null,
        service_id: service_id ?? null,
        client_nombre: `Cliente WhatsApp +${cleanPhone}`,
        client_tel: cleanPhone,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
        precio: service_precio ?? null,
        estado: 'confirmado',
        notas: 'Agendado por WhatsApp bot',
      })

      await saveSession(admin, phone, shop.id, { state: 'menu', data: {} })

      if (error) return `Hubo un error al crear tu cita 😓 Por favor llama directamente a ${shop.nombre}.`

      const fechaLabel = formatFechaES(fecha!)
      return `✅ *¡Cita confirmada!*\n\n✂️ ${service_name}\n📅 ${fechaLabel} a las ${horaLabel(slot_hora!)}\n📍 ${shop.nombre}\n\nTe esperamos. Si necesitas cambiar algo, contáctanos directamente.\n\nEscribe *menú* para volver al inicio.`
    }

    if (['no', 'n', 'cancelar', '2'].includes(resp)) {
      await saveSession(admin, phone, shop.id, { state: 'menu', data: {} })
      return `Cita cancelada. Escribe *menú* cuando quieras agendar.`
    }

    return `Responde *SÍ* para confirmar o *NO* para cancelar.`
  }

  // fallback
  await saveSession(admin, phone, shop.id, { state: 'menu', data: {} })
  return msgMenu(shop.nombre)
}

function barberName(n: string | undefined) { return n ?? 'cualquier barbero' }
function horaLabel(hora: string): string {
  const [h, m] = hora.split(':').map(Number)
  const ampm = h < 12 ? 'am' : 'pm'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}
