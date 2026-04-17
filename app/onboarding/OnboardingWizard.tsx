'use client'

import { useState, useTransition } from 'react'
import {
  Scissors, Store, Tag, Users, CheckCircle,
  ArrowRight, Loader2, ChevronRight, Zap
} from 'lucide-react'
import { saveOnboardingService, saveOnboardingBarber, completeOnboarding } from '@/lib/actions/onboarding'

interface Props {
  shopNombre: string
}

const STEPS = [
  { id: 'bienvenida', label: 'Barbería',  icon: Store   },
  { id: 'servicio',   label: 'Servicio',  icon: Tag     },
  { id: 'barbero',    label: 'Barbero',   icon: Users   },
  { id: 'listo',      label: '¡Listo!',   icon: CheckCircle },
]

export default function OnboardingWizard({ shopNombre }: Props) {
  const [step, setStep] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [serviceNombre, setServiceNombre] = useState('')
  const [servicePrecio, setServicePrecio] = useState('')
  const [serviceDuracion, setServiceDuracion] = useState('30')
  const [barberNombre, setBarberNombre] = useState('')
  const [barberTel, setBarberTel] = useState('')

  function next() { setStep(s => s + 1) }

  function handleServicio(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('nombre', serviceNombre)
    fd.set('precio', servicePrecio)
    fd.set('duracion_min', serviceDuracion)
    startTransition(async () => {
      await saveOnboardingService(fd)
      next()
    })
  }

  function handleBarbero(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('nombre', barberNombre)
    fd.set('telefono', barberTel)
    startTransition(async () => {
      if (barberNombre.trim()) await saveOnboardingBarber(fd)
      next()
    })
  }

  function handleFinalizar() {
    startTransition(async () => { await completeOnboarding() })
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#080808',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '32px 20px 48px',
      fontFamily: 'var(--font-sans, Inter, sans-serif)',
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: '#F5C500', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Scissors style={{ width: 15, height: 15, color: '#000' }} />
        </div>
        <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: '-0.02em', color: '#fff', fontFamily: 'var(--font-serif, Georgia)' }}>
          Barber<span style={{ color: '#F5C500' }}>Loyalty</span>
        </span>
      </div>

      {/* Progress steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40, width: '100%', maxWidth: 380 }}>
        {STEPS.map(({ label, icon: Icon }, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {/* connector line */}
            {i < STEPS.length - 1 && (
              <div style={{
                position: 'absolute', top: 14, left: '50%', width: '100%', height: 2,
                background: i < step ? '#F5C500' : 'rgba(255,255,255,0.08)',
                transition: 'background 0.3s',
              }} />
            )}
            <div style={{
              width: 28, height: 28, borderRadius: '50%', zIndex: 1,
              background: i < step ? '#F5C500' : i === step ? 'rgba(245,197,0,0.15)' : 'rgba(255,255,255,0.06)',
              border: i === step ? '2px solid #F5C500' : i < step ? 'none' : '2px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
            }}>
              {i < step
                ? <CheckCircle style={{ width: 14, height: 14, color: '#000' }} />
                : <Icon style={{ width: 12, height: 12, color: i === step ? '#F5C500' : 'rgba(255,255,255,0.3)' }} />
              }
            </div>
            <span style={{ fontSize: 9, marginTop: 5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: i === step ? '#F5C500' : i < step ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(255,255,255,0.03)',
        border: '1.5px solid rgba(255,255,255,0.08)',
        borderRadius: 24, padding: '32px 28px',
      }}>

        {/* ── STEP 0: Bienvenida ── */}
        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18, background: '#F5C500',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 32px rgba(245,197,0,0.35)',
            }}>
              <Store style={{ width: 28, height: 28, color: '#000' }} />
            </div>
            <h1 style={{ margin: '0 0 10px', fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', fontFamily: 'var(--font-serif, Georgia)' }}>
              ¡Bienvenido a BarberLoyalty!
            </h1>
            <p style={{ margin: '0 0 8px', fontSize: 15, color: '#F5C500', fontWeight: 700 }}>
              {shopNombre}
            </p>
            <p style={{ margin: '0 0 28px', fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
              Tu barbería está creada. En 2 minutos configuramos lo esencial para que el bot y la agenda funcionen.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, textAlign: 'left' }}>
              {[
                { icon: Tag,            label: 'Agrega tu primer servicio y precio' },
                { icon: Users,          label: 'Registra tu primer barbero' },
                { icon: Zap,            label: 'El bot queda listo para recibir citas' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(245,197,0,0.1)', border: '1px solid rgba(245,197,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ width: 14, height: 14, color: '#F5C500' }} />
                  </div>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{label}</span>
                </div>
              ))}
            </div>
            <button onClick={next} style={{
              width: '100%', background: '#F5C500', color: '#000',
              border: 'none', borderRadius: 999, padding: '14px 0',
              fontSize: 15, fontWeight: 900, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'var(--font-sans, Inter, sans-serif)',
              boxShadow: '0 6px 24px rgba(245,197,0,0.35)',
            }}>
              Empezar configuración <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        )}

        {/* ── STEP 1: Servicio ── */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#F5C500', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Paso 1 de 2</span>
              <h2 style={{ margin: '6px 0 6px', fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', fontFamily: 'var(--font-serif, Georgia)' }}>
                Tu primer servicio
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                El bot lo ofrecerá a tus clientes al agendar
              </p>
            </div>
            <form onSubmit={handleServicio} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Nombre del servicio *</label>
                <input
                  required value={serviceNombre}
                  onChange={e => setServiceNombre(e.target.value)}
                  placeholder="Ej: Corte clásico"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Precio (S/) *</label>
                  <input
                    required type="number" min="0" step="0.50"
                    value={servicePrecio}
                    onChange={e => setServicePrecio(e.target.value)}
                    placeholder="25"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Duración (min)</label>
                  <select value={serviceDuracion} onChange={e => setServiceDuracion(e.target.value)} style={inputStyle}>
                    {[15,20,30,45,60,90].map(m => <option key={m} value={m}>{m} min</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={isPending} style={btnStyle}>
                {isPending ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : null}
                Guardar y continuar <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 2: Barbero ── */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#F5C500', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Paso 2 de 2</span>
              <h2 style={{ margin: '6px 0 6px', fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', fontFamily: 'var(--font-serif, Georgia)' }}>
                Tu primer barbero
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                Los clientes podrán elegirlo al agendar. Puedes omitir esto.
              </p>
            </div>
            <form onSubmit={handleBarbero} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Nombre</label>
                <input
                  value={barberNombre}
                  onChange={e => setBarberNombre(e.target.value)}
                  placeholder="Ej: Carlos Mendoza"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Teléfono (opcional)</label>
                <input
                  value={barberTel}
                  onChange={e => setBarberTel(e.target.value)}
                  placeholder="987654321"
                  style={inputStyle}
                />
              </div>
              <button type="submit" disabled={isPending} style={btnStyle}>
                {isPending ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : null}
                {barberNombre.trim() ? 'Guardar y continuar' : 'Omitir por ahora'} <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 3: ¡Listo! ── */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: '#F5C500',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 40px rgba(245,197,0,0.45)',
              animation: 'pulse 2s infinite',
            }}>
              <CheckCircle style={{ width: 32, height: 32, color: '#000' }} />
            </div>
            <h2 style={{ margin: '0 0 10px', fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', fontFamily: 'var(--font-serif, Georgia)' }}>
              ¡Tu barbería está lista!
            </h2>
            <p style={{ margin: '0 0 28px', fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
              Puedes empezar a registrar visitas y fidelizar clientes desde ya.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28, textAlign: 'left' }}>
              {[
                '✅ Barbería configurada',
                serviceNombre ? `✅ Servicio "${serviceNombre}" agregado` : '✅ Listo para agregar servicios',
                barberNombre ? `✅ Barbero "${barberNombre}" registrado` : '⚡ Agrega barberos en Admin',
                '⚡ Activa el Bot WhatsApp en Admin → Bot WhatsApp',
              ].map(item => (
                <div key={item} style={{ fontSize: 13, color: item.startsWith('✅') ? 'rgba(255,255,255,0.7)' : 'rgba(245,197,0,0.7)', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                  {item}
                </div>
              ))}
            </div>
            <button onClick={handleFinalizar} disabled={isPending} style={btnStyle}>
              {isPending ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : null}
              Ir al dashboard <ArrowRight style={{ width: 15, height: 15 }} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 7,
}
const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.05)',
  border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 12,
  padding: '11px 14px', fontSize: 14, color: '#fff',
  outline: 'none', boxSizing: 'border-box',
  fontFamily: 'var(--font-sans, Inter, sans-serif)',
}
const btnStyle: React.CSSProperties = {
  width: '100%', background: '#F5C500', color: '#000',
  border: 'none', borderRadius: 999, padding: '14px 0',
  fontSize: 15, fontWeight: 900, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  fontFamily: 'var(--font-sans, Inter, sans-serif)',
  boxShadow: '0 6px 24px rgba(245,197,0,0.35)',
}
