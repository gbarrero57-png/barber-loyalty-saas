import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const admin = createAdminClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://barber-loyalty-saas.vercel.app'

    const { data: su } = await admin
      .from('shop_users')
      .select('shop_id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (!su?.shop_id) return NextResponse.json({ error: 'Barbería no encontrada' }, { status: 404 })

    const { data: sub } = await admin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('shop_id', su.shop_id)
      .single()

    if (!sub?.stripe_customer_id) return NextResponse.json({ error: 'Sin suscripción activa' }, { status: 400 })

    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${appUrl}/upgrade`,
    })

    return NextResponse.json({ url: portal.url })
  } catch (e: any) {
    console.error('[stripe/portal]', e)
    return NextResponse.json({ error: e?.message ?? 'Error interno' }, { status: 500 })
  }
}
