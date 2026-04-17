'use server'

import Stripe from 'stripe'
import { redirect } from 'next/navigation'
import { getMyShop } from './shop'
import { createAdminClient } from '@/lib/supabase/admin'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured')
  return new Stripe(key)
}

export async function createCheckoutSession() {
  const shop = await getMyShop()
  if (!shop) redirect('/login')

  const priceId = process.env.STRIPE_PRICE_ID
  if (!priceId) throw new Error('STRIPE_PRICE_ID not configured')

  const stripe = getStripe()
  const admin = createAdminClient()

  // Retrieve or create Stripe customer
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://barber-loyalty-saas.vercel.app'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${appUrl}/upgrade`,
    metadata: { shop_id: shop.id },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
  })

  redirect(session.url!)
}

export async function createPortalSession() {
  const shop = await getMyShop()
  if (!shop) redirect('/login')

  const stripe = getStripe()
  const admin = createAdminClient()

  const { data: sub } = await admin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('shop_id', shop.id)
    .single()

  if (!sub?.stripe_customer_id) redirect('/upgrade')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://barber-loyalty-saas.vercel.app'

  const portal = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${appUrl}/upgrade`,
  })

  redirect(portal.url)
}
