import { getSchedules, upsertSchedule, deleteSchedule } from '@/lib/actions/schedules'
import { DIAS_SEMANA as DIAS } from '@/lib/constants'
import { getBarbers } from '@/lib/actions/barbers'
import { Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HorariosPage() {
  const [schedules, barbers] = await Promise.all([getSchedules(null), getBarbers()])
  const activeBarbers = barbers.filter((b: any) => b.activo)

  const schedulesByDay: Record<number, any[]> = {}
  for (let i = 0; i < 7; i++) schedulesByDay[i] = []
  schedules.forEach((s: any) => schedulesByDay[s.dia_semana].push(s))

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Horarios</h1>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>
          Configura los días y horas de atención de tu barbería
        </p>
      </div>

      {/* Configuración global de la barbería */}
      <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock className="w-3.5 h-3.5" /> Horario general de la barbería
        </p>

        {/* Tabla por día */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {[1, 2, 3, 4, 5, 6, 0].map(dia => {
            const existing = schedulesByDay[dia]?.[0]
            return (
              <div key={dia} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 80px auto', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: dia === 0 ? '#f87171' : '#e5e7eb' }}>
                  {DIAS[dia]}
                </span>
                <form action={upsertSchedule} style={{ display: 'contents' }}>
                  <input type="hidden" name="barber_id" value="" />
                  <input type="hidden" name="dia_semana" value={dia} />
                  <input name="hora_inicio" type="time" defaultValue={existing?.hora_inicio ?? '09:00'}
                    style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 7, padding: '7px 10px', color: '#fff', fontSize: 13 }} />
                  <input name="hora_fin" type="time" defaultValue={existing?.hora_fin ?? '18:00'}
                    style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 7, padding: '7px 10px', color: '#fff', fontSize: 13 }} />
                  <select name="activo" defaultValue={existing?.activo === false ? 'false' : 'true'}
                    style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 7, padding: '7px 8px', color: existing?.activo === false ? '#f87171' : '#34d399', fontSize: 12 }}>
                    <option value="true">Abierto</option>
                    <option value="false">Cerrado</option>
                  </select>
                  <button type="submit" style={{ padding: '7px 12px', borderRadius: 7, border: '1px solid #2a2a2a', background: 'transparent', color: '#818cf8', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    Guardar
                  </button>
                </form>
              </div>
            )
          })}
        </div>

        <p style={{ margin: 0, fontSize: 11, color: '#4b5563' }}>
          Estos son los horarios que usa el bot WhatsApp para mostrar disponibilidad de citas.
        </p>
      </div>

      {/* Horarios por barbero (si hay barberos) */}
      {activeBarbers.length > 0 && (
        <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 14, padding: 20 }}>
          <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Horarios por barbero (opcional)
          </p>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: '#6b7280' }}>
            Si un barbero tiene horario distinto al general, configúralo aquí. Si no, usará el horario general.
          </p>

          {activeBarbers.map((barber: any) => (
            <div key={barber.id} style={{ marginBottom: 20 }}>
              <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 13, color: '#e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#4f46e5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>
                  {barber.nombre.charAt(0)}
                </span>
                {barber.nombre}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[1, 2, 3, 4, 5, 6].map(dia => (
                  <div key={dia} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 80px auto', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{DIAS[dia]}</span>
                    <form action={upsertSchedule} style={{ display: 'contents' }}>
                      <input type="hidden" name="barber_id" value={barber.id} />
                      <input type="hidden" name="dia_semana" value={dia} />
                      <input name="hora_inicio" type="time" defaultValue="09:00"
                        style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 7, padding: '6px 8px', color: '#fff', fontSize: 12 }} />
                      <input name="hora_fin" type="time" defaultValue="18:00"
                        style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 7, padding: '6px 8px', color: '#fff', fontSize: 12 }} />
                      <select name="activo" defaultValue="true"
                        style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 7, padding: '6px 8px', color: '#34d399', fontSize: 11 }}>
                        <option value="true">Abierto</option>
                        <option value="false">Cerrado</option>
                      </select>
                      <button type="submit" style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid #2a2a2a', background: 'transparent', color: '#818cf8', fontSize: 11, cursor: 'pointer' }}>
                        ✓
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
