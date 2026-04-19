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

    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) return NextResponse.json({ error: 'STRIPE_SECRET_KEY missing' }, { status: 500 })
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-01-27.acacia' as any,
      httpClient: Stripe.createNodeHttpClient(),
    })
    const admin = createAdminClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://barber-loyalty-saas.vercel.app'

    // Get shop
    const { data: su } = await admin
      .from('shop_users')
      .select('shop_id, shops(id, nombre)')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (!su?.shops) return NextResponse.json({ error: 'Barbería no encontrada' }, { status: 404 })
    const shop = su.shops as any

    // Get or create Stripe customer
    const { data: sub } = await admin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('shop_id', shop.id)
      .single()

    let customerId: string | undefined = sub?.stripe_customer_id ?? undefined
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: shop.nombre,
        metadata: { shop_id: shop.id },
      })
      customerId = customer.id
      await admin.from('subscriptions').upsert(
        { shop_id: shop.id, stripe_customer_id: customerId },
        { onConflict: 'shop_id' }
      )
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: `${appUrl}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/upgrade`,
      metadata: { shop_id: shop.id },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    const msg = e?.message ?? String(e)
    const type = e?.type ?? e?.constructor?.name ?? 'unknown'
    console.error('[stripe/checkout]', type, msg)
    return NextResponse.json({ error: `${type}: ${msg}` }, { status: 500 })
  }
}
