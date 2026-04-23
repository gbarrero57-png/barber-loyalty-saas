import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidad — Barber Loyalty',
  description: 'Cómo recopilamos, usamos y protegemos tus datos en Barber Loyalty',
}

const s = {
  page: { minHeight: '100vh', background: '#0A0A0A', padding: '40px 20px', fontFamily: 'var(--sans, sans-serif)' } as React.CSSProperties,
  wrap: { maxWidth: 680, margin: '0 auto' } as React.CSSProperties,
  back: { color: 'rgba(245,197,0,0.7)', fontSize: 13, textDecoration: 'none', display: 'inline-block', marginBottom: 28 } as React.CSSProperties,
  logo: { fontSize: 22, fontWeight: 900, color: '#FFD700', marginBottom: 6 } as React.CSSProperties,
  title: { fontSize: 26, fontWeight: 900, color: '#fff', margin: '0 0 6px' } as React.CSSProperties,
  date: { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 36 } as React.CSSProperties,
  h2: { fontSize: 15, fontWeight: 800, color: '#fff', margin: '32px 0 10px' } as React.CSSProperties,
  p: { fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: '0 0 12px' } as React.CSSProperties,
  ul: { paddingLeft: 20, margin: '0 0 12px' } as React.CSSProperties,
  li: { fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 4 } as React.CSSProperties,
  table: { width: '100%', borderCollapse: 'collapse' as const, marginBottom: 20 },
  th: { fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textAlign: 'left' as const, padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  td: { fontSize: 13, color: 'rgba(255,255,255,0.6)', padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'top' as const },
  hr: { border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', margin: '36px 0' } as React.CSSProperties,
  email: { color: '#FFD700' } as React.CSSProperties,
}

export default function PrivacyPage() {
  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <Link href="/" style={s.back}>← Inicio</Link>
        <p style={s.logo}>✂️ Barber Loyalty</p>
        <h1 style={s.title}>Política de Privacidad</h1>
        <p style={s.date}>Última actualización: abril 2025</p>

        <p style={s.p}>
          En Barber Loyalty nos tomamos en serio la privacidad de tus datos y los de tus clientes.
          Esta política explica qué información recopilamos, cómo la usamos y cómo la protegemos.
        </p>

        <h2 style={s.h2}>1. Responsable del Tratamiento</h2>
        <p style={s.p}>
          Barber Loyalty opera la plataforma accesible en barber-loyalty.com.
          Para consultas sobre privacidad: <a href="mailto:soporte@barber-loyalty.com" style={s.email}>soporte@barber-loyalty.com</a>
        </p>

        <h2 style={s.h2}>2. Datos que Recopilamos</h2>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Categoría</th>
              <th style={s.th}>Datos</th>
              <th style={s.th}>Finalidad</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Cuenta del dueño', 'Email, contraseña (cifrada)', 'Autenticación y comunicación'],
              ['Barbería', 'Nombre, dirección, teléfono', 'Configuración del servicio'],
              ['Clientes de la barbería', 'Nombre, DNI/CE, email, teléfono', 'Programa de fidelidad y citas'],
              ['Citas', 'Fecha, servicio, barbero, estado', 'Gestión de agenda'],
              ['Pagos de clientes', 'Email, monto, concepto', 'Registro de cobros en línea'],
              ['Movimientos de caja', 'Monto, categoría, método de pago', 'Control financiero'],
              ['Conversaciones WhatsApp', 'Número de teléfono, mensajes', 'Funcionamiento del bot'],
              ['Facturación (Stripe)', 'Datos de tarjeta (Stripe los gestiona)', 'Cobro de suscripción'],
            ].map(([cat, data, purpose]) => (
              <tr key={cat}>
                <td style={{ ...s.td, color: '#fff', fontWeight: 600 }}>{cat}</td>
                <td style={s.td}>{data}</td>
                <td style={s.td}>{purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 style={s.h2}>3. Base Legal del Tratamiento</h2>
        <ul style={s.ul}>
          <li style={s.li}><strong style={{ color: '#fff' }}>Ejecución contractual:</strong> datos necesarios para prestarte el servicio contratado.</li>
          <li style={s.li}><strong style={{ color: '#fff' }}>Interés legítimo:</strong> mejorar la plataforma y prevenir fraudes.</li>
          <li style={s.li}><strong style={{ color: '#fff' }}>Consentimiento:</strong> comunicaciones de marketing (puedes revocarlos en cualquier momento).</li>
          <li style={s.li}><strong style={{ color: '#fff' }}>Obligación legal:</strong> conservación de registros contables según ley peruana.</li>
        </ul>

        <h2 style={s.h2}>4. Cómo Usamos tus Datos</h2>
        <ul style={s.ul}>
          <li style={s.li}>Proveer y mejorar la plataforma.</li>
          <li style={s.li}>Enviar emails transaccionales (bienvenida, sellos, premios, comprobantes).</li>
          <li style={s.li}>Enviar recordatorios de citas vía WhatsApp a los clientes de tu barbería.</li>
          <li style={s.li}>Procesar pagos de suscripción a través de Stripe.</li>
          <li style={s.li}>Enviarte avisos de servicio y actualizaciones importantes.</li>
        </ul>
        <p style={s.p}>
          <strong style={{ color: '#fff' }}>Nunca vendemos tus datos ni los de tus clientes a terceros.</strong>
        </p>

        <h2 style={s.h2}>5. Terceros que Procesan Datos</h2>
        <ul style={s.ul}>
          <li style={s.li}><strong style={{ color: '#fff' }}>Supabase</strong> — base de datos y autenticación (servidores en EE.UU., cumple SOC 2).</li>
          <li style={s.li}><strong style={{ color: '#fff' }}>Stripe</strong> — procesamiento de pagos (PCI-DSS Level 1).</li>
          <li style={s.li}><strong style={{ color: '#fff' }}>Twilio</strong> — envío de mensajes WhatsApp (servidores en EE.UU.).</li>
          <li style={s.li}><strong style={{ color: '#fff' }}>Brevo</strong> — envío de emails transaccionales (servidores en la UE).</li>
          <li style={s.li}><strong style={{ color: '#fff' }}>Vercel</strong> — infraestructura de hosting (servidores en EE.UU./global).</li>
        </ul>

        <h2 style={s.h2}>6. Retención de Datos</h2>
        <ul style={s.ul}>
          <li style={s.li}>Datos de cuenta activa: mientras tengas cuenta.</li>
          <li style={s.li}>Tras cancelar: eliminamos tus datos en un plazo de 90 días, salvo obligación legal.</li>
          <li style={s.li}>Registros de pago: 5 años según legislación tributaria peruana.</li>
        </ul>

        <h2 style={s.h2}>7. Tus Derechos</h2>
        <p style={s.p}>Tienes derecho a:</p>
        <ul style={s.ul}>
          <li style={s.li}><strong style={{ color: '#fff' }}>Acceso:</strong> solicitar una copia de tus datos.</li>
          <li style={s.li}><strong style={{ color: '#fff' }}>Rectificación:</strong> corregir datos inexactos.</li>
          <li style={s.li}><strong style={{ color: '#fff' }}>Eliminación:</strong> solicitar que borremos tu cuenta y datos.</li>
          <li style={s.li}><strong style={{ color: '#fff' }}>Portabilidad:</strong> exportar tus datos en formato CSV desde la plataforma.</li>
          <li style={s.li}><strong style={{ color: '#fff' }}>Oposición:</strong> oponerte a ciertos usos de tus datos.</li>
        </ul>
        <p style={s.p}>
          Para ejercer estos derechos, escríbenos a{' '}
          <a href="mailto:soporte@barber-loyalty.com" style={s.email}>soporte@barber-loyalty.com</a>.
          Respondemos en un plazo máximo de 15 días hábiles.
        </p>

        <h2 style={s.h2}>8. Seguridad</h2>
        <ul style={s.ul}>
          <li style={s.li}>Todas las comunicaciones usan HTTPS/TLS.</li>
          <li style={s.li}>Las contraseñas se almacenan cifradas (bcrypt via Supabase Auth).</li>
          <li style={s.li}>Acceso a la base de datos controlado por Row Level Security (RLS).</li>
          <li style={s.li}>Las claves de API nunca se exponen al cliente.</li>
        </ul>

        <h2 style={s.h2}>9. Cookies</h2>
        <p style={s.p}>
          Usamos únicamente cookies de sesión necesarias para el funcionamiento de la autenticación.
          No usamos cookies de seguimiento ni publicidad.
        </p>

        <h2 style={s.h2}>10. Cambios a esta Política</h2>
        <p style={s.p}>
          Notificaremos cambios relevantes por email con al menos 15 días de anticipación.
          La versión actualizada siempre estará disponible en esta página.
        </p>

        <hr style={s.hr} />
        <p style={s.p}>
          ¿Preguntas sobre privacidad?{' '}
          <a href="mailto:soporte@barber-loyalty.com" style={s.email}>soporte@barber-loyalty.com</a>
        </p>
        <p style={{ ...s.p, marginTop: 20 }}>
          <Link href="/terms" style={{ color: '#FFD700', textDecoration: 'none' }}>→ Términos de Servicio</Link>
        </p>
      </div>
    </div>
  )
}
