import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({ request })

    const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Si las env vars no están disponibles, dejar pasar (evita 500 en middleware)
    if (!supabaseUrl || !supabaseAnon) {
      console.error('[proxy] Missing Supabase env vars — allowing request through')
      return NextResponse.next({ request })
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnon, {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname

    const isAuth = path.startsWith('/login') || path.startsWith('/register')
    const isSuperAdmin = path.startsWith('/superadmin')
    const isPublic = path === '/' || path.startsWith('/pagar') || path.startsWith('/api/')

    // Rutas sin auth
    if (isSuperAdmin || isPublic) return supabaseResponse

    // Solo redirigir a /login si no está autenticado y no es página de auth
    if (!user && !isAuth) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // No redirigir desde /register aunque esté autenticado (evita loop cuando no tiene shop aún)

    return supabaseResponse
  } catch (err) {
    // Si el proxy falla por cualquier razón, loguear y dejar pasar
    console.error('[proxy] Error:', err instanceof Error ? err.message : String(err))
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
