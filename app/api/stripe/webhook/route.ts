import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 })
  }

  const body = await req.text()
  const sig  = req.headers.get('stripe-signature') ?? ''

  const stripe = new Stripe(secretKey)
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const shop_id = session.metadata?.shop_id
      if (!shop_id) break

      await admin.from('subscriptions').upsert({
        shop_id,
        plan:                   'phase2',
        status:                 'active',
        precio_mes:             79,
        stripe_customer_id:     session.customer as string,
        stripe_subscription_id: session.subscription as string,
      }, { onConflict: 'shop_id' })
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      // Keep active on renewal
      await admin.from('subscriptions')
        .update({ status: 'active' })
        .eq('stripe_customer_id', customerId)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      await admin.from('subscriptions')
        .update({ status: 'paused' })
        .eq('stripe_customer_id', customerId)
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const stripeStatus = sub.status // active | past_due | canceled | unpaid | trialing | paused
      const statusMap: Record<string, string> = {
        active:   'active',
        trialing: 'active',
        past_due: 'paused',
        unpaid:   'paused',
        paused:   'paused',
        canceled: 'cancelled',
      }
      const dbStatus = statusMap[stripeStatus] ?? 'paused'
      const dbPlan   = (stripeStatus === 'canceled') ? 'phase1' : 'phase2'
      await admin.from('subscriptions')
        .update({ plan: dbPlan, status: dbStatus })
        .eq('stripe_customer_id', customerId)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      await admin.from('subscriptions')
        .update({ plan: 'phase1', status: 'cancelled', stripe_subscription_id: null })
        .eq('stripe_customer_id', customerId)
      break
    }
  }

  return NextResponse.json({ ok: true })
}
