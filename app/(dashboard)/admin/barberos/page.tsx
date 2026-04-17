import { getBarbers, createBarber, toggleBarberActive, deleteBarber } from '@/lib/actions/barbers'
import { getMyShop } from '@/lib/actions/shop'
import { UserPlus, Scissors, Phone, Mail, Users, Lock } from 'lucide-react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import UpgradeGate from '@/components/UpgradeGate'

export const dynamic = 'force-dynamic'

export default async function BarberosPage() {
  const [barbers, shop] = await Promise.all([getBarbers(), getMyShop()])
  const isPhase2 = shop?.subscription_plan === 'phase2'

  return (
    <div>
      <Link href="/admin" className="link-back" style={{ marginBottom: 18, display: 'inline-flex' }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Admin
      </Link>
      <h1 className="page-title">Barberos</h1>
      <p className="page-subtitle">{barbers.length} registrados</p>

      {/* Formulario — siempre visible, pero en Phase 1 bloqueado si ya tiene 1 */}
      {(isPhase2 || barbers.length === 0) && (
        <div className="section-card">
          <p className="section-title"><UserPlus className="w-3.5 h-3.5" /> Añadir barbero</p>
          <form action={createBarber} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="input-label">Nombre *</label>
                <input name="nombre" required placeholder="Carlos Mendoza" />
              </div>
              <div>
                <label className="input-label">Teléfono</label>
                <input name="telefono" placeholder="987654321" />
              </div>
            </div>
            <div>
              <label className="input-label">Email</label>
              <input name="email" type="email" placeholder="carlos@barberia.com" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-add">+ Añadir</button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de barberos existentes */}
      {barbers.length === 0 ? (
        <div className="empty-state">
          <Scissors className="w-10 h-10" style={{ margin: '0 auto', opacity: 0.2 }} />
          <p>No hay barberos registrados aún</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {barbers.map((b: any) => (
            <div key={b.id} className="card" style={{
              borderColor: b.activo ? 'rgba(255,255,255,0.08)' : 'rgba(248,113,113,0.1)',
              opacity: b.activo ? 1 : 0.65, padding: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--yellow)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, fontWeight: 800, color: '#000', fontFamily: 'var(--serif)',
                }}>
                  {b.nombre.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{b.nombre}</p>
                  <span className={`badge ${b.activo ? 'badge-active' : 'badge-inactive'}`}>
                    {b.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              {(b.telefono || b.email) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12, paddingLeft: 56 }}>
                  {b.telefono && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--muted)' }}><Phone className="w-3 h-3" /> {b.telefono}</span>}
                  {b.email && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--muted)' }}><Mail className="w-3 h-3" /> {b.email}</span>}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <form action={toggleBarberActive.bind(null, b.id, !b.activo)}>
                  <button type="submit" className={`btn-sm ${b.activo ? 'btn-sm-danger' : 'btn-sm-success'}`}>
                    {b.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </form>
                <form action={deleteBarber.bind(null, b.id)}>
                  <button type="submit" className="btn-sm btn-sm-muted"
                    onClick={(e) => { if (!confirm('¿Eliminar barbero?')) e.preventDefault() }}>
                    Eliminar
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Phase 1: gate para agregar más barberos */}
      {!isPhase2 && barbers.length >= 1 && (
        <UpgradeGate
          feature="Múltiples Barberos"
          description="En el plan Básico solo puedes tener 1 barbero. Con Barber Pro agrega todo tu equipo y lleva el control de cada uno."
          icon={Users}
          bullets={[
            'Barberos ilimitados',
            'Asignar citas por barbero',
            'Ingresos separados por barbero',
            'Cada barbero con su perfil',
          ]}
        />
      )}
    </div>
  )
}
