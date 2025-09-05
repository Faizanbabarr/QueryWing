import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY
    if (!stripeSecret) return NextResponse.json({ ok: true })
    const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' })

    // Read raw body for signature verification
    const rawBody = await req.text()
    const signature = req.headers.get('stripe-signature') || ''
    const whSecret = process.env.STRIPE_WEBHOOK_SECRET

    let event: Stripe.Event
    if (whSecret) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, whSecret)
      } catch (err) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    } else {
      // Fallback without verification (not recommended for production)
      event = JSON.parse(rawBody)
    }

    // Helper: map Stripe price ID to plan
    const idToPlan = new Map<string, string>([
      [process.env.STRIPE_PRICE_STARTER || '', 'free'],
      [process.env.STRIPE_PRICE_GROWTH || '', 'growth'],
      [process.env.STRIPE_PRICE_SCALE || '', 'scale']
    ].filter(([k]) => !!k) as any)

    const updateTenantPlanByEmail = async (email: string | null | undefined, plan: string | null) => {
      if (!email) return
      try {
        const user = await db.user.findFirst({ where: { email } })
        if (!user) return
        if (plan) {
          await db.tenant.update({ where: { id: user.tenantId }, data: { plan } })
          try { (globalThis as any).__querywing_tenantPlans = { ...(globalThis as any).__querywing_tenantPlans, [user.tenantId]: plan } } catch {}
        }
      } catch {}
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const email = session.customer_details?.email || (session.customer_email as string | undefined)
        if (email) {
          // Provision workspace if needed
          try {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/v1/provision`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, name: 'Workspace' })
            })
          } catch {}
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const email = (sub as any)?.customer_email || (sub as any)?.customer?.email
        const priceId = sub.items?.data?.[0]?.price?.id || ''
        const plan = idToPlan.get(priceId) || 'growth'
        await updateTenantPlanByEmail(email, plan)
        // Optionally store subscription record
        try {
          await db.subscription.upsert({
            where: { id: sub.id },
            update: {
              plan,
              seats: 1,
              usagePeriodStart: new Date((sub.current_period_start || 0) * 1000),
              usagePeriodEnd: new Date((sub.current_period_end || 0) * 1000),
              limitsJson: plan === 'scale' ? { messages: 'unlimited', leads: 'unlimited' } : plan === 'growth' ? { messages: 5000, leads: 1000 } : { messages: 200, leads: 50 }
            },
            create: {
              id: sub.id,
              tenantId: (await db.user.findFirst({ where: { email } }))?.tenantId || '',
              plan,
              seats: 1,
              usagePeriodStart: new Date((sub.current_period_start || 0) * 1000),
              usagePeriodEnd: new Date((sub.current_period_end || 0) * 1000),
              limitsJson: plan === 'scale' ? { messages: 'unlimited', leads: 'unlimited' } : plan === 'growth' ? { messages: 5000, leads: 1000 } : { messages: 200, leads: 50 }
            }
          })
        } catch {}
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const email = (sub as any)?.customer_email || (sub as any)?.customer?.email
        await updateTenantPlanByEmail(email, 'free')
        break
      }
      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (e) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}

export async function GET() { return NextResponse.json({ ok: true }) }


