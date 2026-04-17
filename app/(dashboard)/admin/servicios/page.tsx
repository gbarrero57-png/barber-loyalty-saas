import { getServices, createService, toggleServiceActive, deleteService } from '@/lib/actions/services'
import { PlusCircle, Tag, Clock } from 'lucide-react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ServiciosPage() {
  const services = await getServices()

  return (
    <div>
      <Link href="/admin" className="link-back" style={{ marginBottom: 18, display: 'inline-flex' }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Admin
      </Link>

      <h1 className="page-title">Servicios</h1>
      <p className="page-subtitle">{services.length} en catálogo</p>

      {/* Formulario */}
      <div className="section-card">
        <p className="section-title">
          <PlusCircle className="w-3.5 h-3.5" /> Añadir servicio
        </p>
        <form action={createService} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
            <div>
              <label className="input-label">Nombre *</label>
              <input name="nombre" required placeholder="Corte clásico" />
            </div>
            <div>
              <label className="input-label">Precio (S/)</label>
              <input name="precio" type="number" step="0.50" min="0" placeholder="25.00" />
            </div>
            <div>
              <label className="input-label">Duración (min)</label>
              <input name="duracion_min" type="number" min="5" step="5" defaultValue={30} />
            </div>
          </div>
          <div>
            <label className="input-label">Descripción</label>
            <input name="descripcion" placeholder="Descripción opcional" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-add">+ Añadir</button>
          </div>
        </form>
      </div>

      {/* Lista */}
      {services.length === 0 ? (
        <div className="empty-state">
          <Tag className="w-10 h-10" style={{ margin: '0 auto', opacity: 0.2 }} />
          <p>No hay servicios registrados aún</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {services.map((s: any) => (
            <div key={s.id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              opacity: s.activo ? 1 : 0.55,
            }}>
              {/* Icono precio */}
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Tag className="w-4 h-4" style={{ color: '#34d399' }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{s.nombre}</p>
                  <span className={`badge ${s.activo ? 'badge-active' : 'badge-inactive'}`}>
                    {s.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--gold)', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
                    S/ {Number(s.precio).toFixed(2)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--muted)' }}>
                    <Clock className="w-3 h-3" /> {s.duracion_min} min
                  </span>
                  {s.descripcion && (
                    <span style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>{s.descripcion}</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <form action={toggleServiceActive.bind(null, s.id, !s.activo)}>
                  <button type="submit" className={`btn-sm ${s.activo ? 'btn-sm-danger' : 'btn-sm-success'}`}>
                    {s.activo ? 'Off' : 'On'}
                  </button>
                </form>
                <form action={deleteService.bind(null, s.id)}>
                  <button type="submit" className="btn-sm btn-sm-muted"
                    onClick={(e) => { if (!confirm('¿Eliminar servicio?')) e.preventDefault() }}>
                    ✕
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
