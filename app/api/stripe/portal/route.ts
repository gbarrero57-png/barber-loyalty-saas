import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) return NextResponse.json({ error: 'STRIPE_SECRET_KEY missing' }, { status: 500 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const admin = createAdminClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://barber-loyalty-saas.vercel.app'

    const { data: su } = await admin
      .from('shop_users')
      .select('shop_id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (!su?.shop_id) return NextResponse.json({ error: 'Barbería no encontrada' }, { status: 404 })

    const { data: subData } = await admin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('shop_id', su.shop_id)
      .single()

    if (!subData?.stripe_customer_id) return NextResponse.json({ error: 'Sin suscripción activa' }, { status: 400 })

    const body = new URLSearchParams({
      customer: subData.stripe_customer_id,
      return_url: `${appUrl}/upgrade`,
    }).toString()

    const res = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
      cache: 'no-store',
    })
    const portal = await res.json()
    if (!res.ok) throw new Error(portal?.error?.message ?? `Stripe error ${res.status}`)

    return NextResponse.json({ url: portal.url })
  } catch (e: any) {
    console.error('[stripe/portal]', e)
    return NextResponse.json({ error: e?.message ?? 'Error interno' }, { status: 500 })
  }
}
