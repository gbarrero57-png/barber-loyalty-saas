/**
 * Calcula slots disponibles para una fecha, shop y barbero dados.
 * Usa barber_schedules para horario laboral, appointments para ocupados.
 */
import { createAdminClient } from '@/lib/supabase/admin'

export interface Slot { hora: string; label: string }  // hora = "HH:MM"

const SLOT_MIN = 30  // minutos por slot

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
function minToTime(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}
function formatHora12(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const ampm = h < 12 ? 'am' : 'pm'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

export async function getAvailableSlots(
  shopId: string,
  fecha: string,       // YYYY-MM-DD
  barberId: string | null,
  duracionMin = 30,
): Promise<Slot[]> {
  const admin = createAdminClient()
  const date = new Date(fecha + 'T00:00:00')
  const diaSemana = date.getDay()  // 0=Dom

  // 1. Obtener horario
  let schedule: { hora_inicio: string; hora_fin: string } | null = null

  if (barberId) {
    const { data } = await admin
      .from('barber_schedules')
      .select('hora_inicio, hora_fin')
      .eq('shop_id', shopId)
      .eq('barber_id', barberId)
      .eq('dia_semana', diaSemana)
      .eq('activo', true)
      .single()
    schedule = data
  }

  if (!schedule) {
    // Horario default de la barbería
    const { data } = await admin
      .from('barber_schedules')
      .select('hora_inicio, hora_fin')
      .eq('shop_id', shopId)
      .is('barber_id', null)
      .eq('dia_semana', diaSemana)
      .eq('activo', true)
      .single()
    schedule = data
  }

  // Default hardcoded si no hay config
  const inicio = schedule ? timeToMin(schedule.hora_inicio) : 9 * 60   // 9:00
  const fin    = schedule ? timeToMin(schedule.hora_fin)    : 18 * 60  // 18:00

  if (inicio >= fin) return []

  // 2. Citas ya ocupadas ese día para ese barbero (o toda la barbería si no hay barbero)
  const startISO = fecha + 'T00:00:00.000Z'
  const endISO   = fecha + 'T23:59:59.000Z'

  let query = admin
    .from('appointments')
    .select('fecha_inicio, fecha_fin')
    .eq('shop_id', shopId)
    .gte('fecha_inicio', startISO)
    .lte('fecha_inicio', endISO)
    .not('estado', 'eq', 'cancelado')

  if (barberId) query = query.eq('barber_id', barberId)

  const { data: occupied } = await query

  const occupiedRanges = (occupied ?? []).map(a => ({
    start: new Date(a.fecha_inicio).getHours() * 60 + new Date(a.fecha_inicio).getMinutes(),
    end:   a.fecha_fin
      ? new Date(a.fecha_fin).getHours() * 60 + new Date(a.fecha_fin).getMinutes()
      : new Date(a.fecha_inicio).getHours() * 60 + new Date(a.fecha_inicio).getMinutes() + duracionMin,
  }))

  // 3. Generar slots disponibles
  const slots: Slot[] = []
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
  const isToday = fecha === new Date().toISOString().slice(0, 10)

  for (let t = inicio; t + duracionMin <= fin; t += SLOT_MIN) {
    if (isToday && t <= nowMin + 30) continue  // mínimo 30min de antelación

    const slotEnd = t + duracionMin
    const isFree = !occupiedRanges.some(r => t < r.end && slotEnd > r.start)
    if (isFree) {
      slots.push({ hora: minToTime(t), label: formatHora12(minToTime(t)) })
    }
  }

  return slots
}

export function addBusinessDays(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function formatFechaES(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
}
