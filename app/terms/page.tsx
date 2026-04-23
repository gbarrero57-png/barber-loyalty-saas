import Link from 'next/link'

export const metadata = {
  title: 'Términos de Servicio — Barber Loyalty',
  description: 'Condiciones de uso de la plataforma Barber Loyalty',
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
  hr: { border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', margin: '36px 0' } as React.CSSProperties,
  email: { color: '#FFD700' } as React.CSSProperties,
}

export default function TermsPage() {
  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <Link href="/" style={s.back}>← Inicio</Link>
        <p style={s.logo}>✂️ Barber Loyalty</p>
        <h1 style={s.title}>Términos de Servicio</h1>
        <p style={s.date}>Última actualización: abril 2025</p>

        <p style={s.p}>
          Bienvenido a Barber Loyalty. Al registrarte y utilizar nuestra plataforma,
          aceptas los siguientes términos y condiciones. Léelos con atención antes de usar el servicio.
        </p>

        <h2 style={s.h2}>1. El Servicio</h2>
        <p style={s.p}>
          Barber Loyalty es una plataforma SaaS (software como servicio) que permite a dueños de barberías
          gestionar programas de fidelización, citas, finanzas y comunicación con sus clientes a través de WhatsApp.
        </p>
        <p style={s.p}>
          El servicio se ofrece en dos planes: <strong style={{ color: '#fff' }}>Básico (gratuito)</strong> y{' '}
          <strong style={{ color: '#FFD700' }}>Barber Pro (S/79/mes)</strong>.
          Las funcionalidades disponibles en cada plan se detallan en la página de precios.
        </p>

        <h2 style={s.h2}>2. Registro y Cuenta</h2>
        <ul style={s.ul}>
          <li style={s.li}>Debes proporcionar información veraz y mantenerla actualizada.</li>
          <li style={s.li}>Eres responsable de la seguridad de tu contraseña.</li>
          <li style={s.li}>Una cuenta es para una barbería. Si tienes varias sucursales, necesitas una cuenta por local.</li>
          <li style={s.li}>Nos reservamos el derecho de suspender cuentas con actividad fraudulenta o que violen estos términos.</li>
        </ul>

        <h2 style={s.h2}>3. Facturación y Pagos</h2>
        <p style={s.p}>
          El plan Barber Pro se factura mensualmente mediante Stripe. Al suscribirte autorizas
          el cobro recurrente hasta que canceles.
        </p>
        <ul style={s.ul}>
          <li style={s.li}>Los pagos se procesan en soles peruanos (S/).</li>
          <li style={s.li}>Puedes cancelar tu suscripción en cualquier momento desde el portal de facturación.
            El acceso Pro continúa hasta el fin del período pagado.</li>
          <li style={s.li}>No se realizan reembolsos por períodos parciales, salvo error de nuestra parte.</li>
          <li style={s.li}>Los precios pueden cambiar con 30 días de aviso previo por email.</li>
        </ul>

        <h2 style={s.h2}>4. Uso Permitido</h2>
        <p style={s.p}>Te comprometes a usar la plataforma únicamente para:</p>
        <ul style={s.ul}>
          <li style={s.li}>Gestionar tu barbería y la relación con tus clientes.</li>
          <li style={s.li}>Enviar comunicaciones a clientes que han interactuado contigo voluntariamente.</li>
          <li style={s.li}>Registrar transacciones reales de tu negocio.</li>
        </ul>
        <p style={s.p}>Está prohibido usar la plataforma para enviar spam, cometer fraude, o cualquier actividad ilegal.</p>

        <h2 style={s.h2}>5. Datos de tus Clientes</h2>
        <p style={s.p}>
          Eres el responsable del tratamiento de los datos personales de tus clientes (nombres, teléfonos, emails).
          Barber Loyalty actúa como encargado de tratamiento. Debes contar con el consentimiento de tus clientes
          para almacenar y comunicarte con ellos a través de la plataforma.
        </p>

        <h2 style={s.h2}>6. Disponibilidad del Servicio</h2>
        <p style={s.p}>
          Nos esforzamos por mantener el servicio disponible 24/7. Sin embargo, no garantizamos
          disponibilidad ininterrumpida. Realizamos mantenimientos programados con aviso previo cuando sea posible.
          No somos responsables por pérdidas derivadas de interrupciones del servicio.
        </p>

        <h2 style={s.h2}>7. Propiedad Intelectual</h2>
        <p style={s.p}>
          La plataforma, su diseño y código son propiedad de Barber Loyalty. Tus datos (clientes, citas,
          movimientos) son tuyos y puedes exportarlos en cualquier momento.
        </p>

        <h2 style={s.h2}>8. Limitación de Responsabilidad</h2>
        <p style={s.p}>
          Barber Loyalty no es responsable por daños indirectos o pérdida de ganancias derivados del uso
          o la imposibilidad de usar el servicio. Nuestra responsabilidad máxima se limita al monto pagado
          en los últimos 3 meses de servicio.
        </p>

        <h2 style={s.h2}>9. Modificaciones</h2>
        <p style={s.p}>
          Podemos actualizar estos términos. Te notificaremos por email con al menos 15 días de anticipación
          ante cambios sustanciales. El uso continuado del servicio después de ese plazo implica aceptación.
        </p>

        <h2 style={s.h2}>10. Ley Aplicable</h2>
        <p style={s.p}>
          Estos términos se rigen por las leyes de la República del Perú.
          Cualquier disputa se resolverá ante los tribunales competentes de Lima.
        </p>

        <hr style={s.hr} />
        <p style={s.p}>
          ¿Preguntas? Escríbenos a{' '}
          <a href="mailto:soporte@barber-loyalty.com" style={s.email}>soporte@barber-loyalty.com</a>
        </p>
        <p style={{ ...s.p, marginTop: 20 }}>
          <Link href="/privacy" style={{ color: '#FFD700', textDecoration: 'none' }}>→ Política de Privacidad</Link>
        </p>
      </div>
    </div>
  )
}
