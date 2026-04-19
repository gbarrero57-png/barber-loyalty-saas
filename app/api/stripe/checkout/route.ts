import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

async function stripePost(path: string, params: Record<string, string>) {
  const key = process.env.STRIPE_SECRET_KEY!
  const body = new URLSearchParams(params).toString()
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    cache: 'no-store',
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message ?? `Stripe error ${res.status}`)
  return data
}

export async function POST() {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) return NextResponse.json({ error: 'STRIPE_SECRET_KEY missing' }, { status: 500 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const admin = createAdminClient()
    const appUrl = 'https://barber-loyalty-saas.vercel.app'

    const { data: su } = await admin
      .from('shop_users')
      .select('shop_id, shops(id, nombre)')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (!su?.shops) return NextResponse.json({ error: 'Barbería no encontrada' }, { status: 404 })
    const shop = su.shops as any

    const { data: sub } = await admin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('shop_id', shop.id)
      .single()

    let customerId: string = sub?.stripe_customer_id ?? ''

    if (!customerId) {
      const customer = await stripePost('/customers', {
        name: shop.nombre,
        'metadata[shop_id]': shop.id,
      })
      customerId = customer.id
      await admin.from('subscriptions').upsert(
        { shop_id: shop.id, stripe_customer_id: customerId },
        { onConflict: 'shop_id' }
      )
    }

    const priceId = (process.env.STRIPE_PRICE_ID ?? '').trim()
    const session = await stripePost('/checkout/sessions', {
      customer: customerId,
      mode: 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      success_url: `${appUrl}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/upgrade`,
      'metadata[shop_id]': shop.id,
      allow_promotion_codes: 'true',
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    console.error('[stripe/checkout]', e)
    return NextResponse.json({ error: e?.message ?? 'Error interno' }, { status: 500 })
  }
}
