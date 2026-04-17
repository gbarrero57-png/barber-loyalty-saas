import { getUpcomingAppointments, createAppointment, updateAppointmentEstado, deleteAppointment } from '@/lib/actions/appointments'
import { getBarbers } from '@/lib/actions/barbers'
import { getServices } from '@/lib/actions/services'
import { getMyShop } from '@/lib/actions/shop'
import { CalendarDays, Clock, User, Scissors, Link } from 'lucide-react'
import UpgradeGate from '@/components/UpgradeGate'

const ESTADO_COLORS: Record<string, { bg: string; text: string }> = {
  pendiente:  { bg: '#fbbf2420', text: '#fbbf24' },
  confirmado: { bg: '#34d39920', text: '#34d399' },
  completado: { bg: '#818cf820', text: '#818cf8' },
  cancelado:  { bg: '#f8717120', text: '#f87171' },
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}
function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })
}

export const dynamic = 'force-dynamic'

export default async function CitasPage() {
  const shop = await getMyShop()
  const isPhase2 = shop?.subscription_plan === 'phase2'

  if (!isPhase2) {
    return (
      <div>
        <h1 className="page-title">Agenda</h1>
        <p className="page-subtitle" style={{ marginBottom: 24 }}>Gestión de citas y turnos</p>
        <UpgradeGate
          feature="Agenda de Citas"
          description="Organiza todos los turnos de tu barbería, evita doble-bookings y deja que el bot de WhatsApp agende por ti automáticamente."
          icon={CalendarDays}
          bullets={[
            'Citas con fecha, barbero y servicio',
            'Confirmar, completar o cancelar',
            'Bot WhatsApp agenda 24/7',
            'Recordatorios automáticos al cliente',
            'Link de cobro por cita',
          ]}
          hint="Incluye bot WhatsApp + recordatorios automáticos"
        />
      </div>
    )
  }

  const [appointments, barbers, services] = await Promise.all([
    getUpcomingAppointments(),
    getBarbers(),
    getServices(),
  ])
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://barber-loyalty-saas.vercel.app'
  const activeBarbers = barbers.filter((b: any) => b.activo)
  const activeServices = services.filter((s: any) => s.activo)

  const grouped: Record<string, any[]> = {}
  for (const a of appointments) {
    const d = new Date(a.fecha_inicio).toDateString()
    if (!grouped[d]) grouped[d] = []
    grouped[d].push(a)
  }

  const nowISO = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)

  return (
    <div>
      <h1 className="page-title">Agenda</h1>
      <p className="page-subtitle">{appointments.length} citas próximas</p>

      {/* Formulario nueva cita */}
      <div className="section-card">
        <p className="section-title">
          <CalendarDays className="w-3.5 h-3.5" /> Nueva cita
        </p>
        <form action={createAppointment} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          <div>
            <label className="input-label">Cliente *</label>
            <input name="client_nombre" required placeholder="Nombre del cliente" />
          </div>
          <div>
            <label className="input-label">Teléfono</label>
            <input name="client_tel" placeholder="987654321" />
          </div>
          <div>
            <label className="input-label">Fecha y hora *</label>
            <input name="fecha_inicio" type="datetime-local" required min={nowISO} />
          </div>
          <div>
            <label className="input-label">Barbero</label>
            <select name="barber_id">
              <option value="">Sin asignar</option>
              {activeBarbers.map((b: any) => <option key={b.id} value={b.id}>{b.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Servicio</label>
            <select name="service_id">
              <option value="">Sin servicio</option>
              {activeServices.map((s: any) => <option key={s.id} value={s.id}>{s.nombre} — S/{Number(s.precio).toFixed(2)}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Duración (min)</label>
            <input name="duracion_min" type="number" min="5" step="5" defaultValue={30} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Notas</label>
            <input name="notas" placeholder="Observaciones (opcional)" />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-add">Agendar cita</button>
          </div>
        </form>
      </div>

      {appointments.length === 0 ? (
        <div className="empty-state">
          <CalendarDays className="w-10 h-10" style={{ margin: '0 auto', opacity: 0.2 }} />
          <p>No hay citas próximas</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {Object.entries(grouped).map(([day, dayAppts]) => (
            <div key={day}>
              <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {formatFecha(dayAppts[0].fecha_inicio)}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dayAppts.map((a: any) => {
                  const cfg = ESTADO_COLORS[a.estado] ?? ESTADO_COLORS.pendiente
                  return (
                    <div key={a.id} className="card" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
                            {formatHora(a.fecha_inicio)}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.text }}>
                            {a.estado}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <User className="w-3.5 h-3.5" style={{ color: 'var(--muted)', flexShrink: 0 }} />
                          {a.client_nombre}
                        </p>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          {a.barbers && <span style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}><Scissors className="w-3 h-3" /> {a.barbers.nombre}</span>}
                          {a.services && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{a.services.nombre} <span style={{ color: '#34d399', fontWeight: 700 }}>S/{Number(a.services.precio).toFixed(2)}</span></span>}
                          {a.notas && <span style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>"{a.notas}"</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 5, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {a.estado === 'pendiente' && (
                          <form action={updateAppointmentEstado.bind(null, a.id, 'confirmado')}>
                            <button type="submit" className="btn-sm btn-sm-success">Confirmar</button>
                          </form>
                        )}
                        {(a.estado === 'pendiente' || a.estado === 'confirmado') && (
                          <form action={updateAppointmentEstado.bind(null, a.id, 'completado')}>
                            <button type="submit" className="btn-sm" style={{ color: '#818cf8', borderColor: 'rgba(129,140,248,0.3)' }}>Completar</button>
                          </form>
                        )}
                        {a.services?.precio && a.estado !== 'completado' && a.estado !== 'cancelado' && (
                          <a href={`${appUrl}/pagar/${shop!.slug}?appt=${a.id}&monto=${Number(a.services.precio).toFixed(2)}&concepto=${encodeURIComponent(a.services.nombre)}`}
                            target="_blank" rel="noopener"
                            style={{ padding: '6px 10px', borderRadius: 999, border: '1.5px solid rgba(52,211,153,0.3)', color: '#34d399', fontSize: 12, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <Link className="w-3 h-3" /> Cobrar
                          </a>
                        )}
                        <form action={deleteAppointment.bind(null, a.id)}>
                          <button type="submit" className="btn-sm btn-sm-muted"
                            onClick={(e) => { if (!confirm('¿Eliminar cita?')) e.preventDefault() }}>✕</button>
                        </form>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
