import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      
      if (session.metadata?.tenantId && session.metadata?.type && session.metadata?.quantity) {
        const { tenantId, type, quantity } = session.metadata
        const qty = parseInt(quantity)

        try {
          // Update tenant with purchased add-ons
          let updateData: any = {}
          
          switch (type) {
            case 'bot_credits':
              updateData.botCredits = { increment: qty }
              break
            case 'additional_bots':
              updateData.maxBots = { increment: qty }
              break
            case 'live_agents':
              updateData.maxLiveAgents = { increment: qty }
              break
            default:
              console.error('Unknown add-on type:', type)
              return NextResponse.json({ received: true })
          }

          await db.tenant.update({
            where: { id: tenantId },
            data: updateData
          })

          // Log the add-on purchase
          await db.event.create({
            data: {
              tenantId,
              type: 'addon_purchased',
              payloadJson: {
                type,
                quantity: qty,
                amount: parseFloat(session.metadata.amount || '0'),
                stripeSessionId: session.id,
                timestamp: new Date().toISOString()
              }
            }
          })

          console.log(`Successfully processed add-on purchase: ${type} x${qty} for tenant ${tenantId}`)
        } catch (error) {
          console.error('Error processing add-on purchase:', error)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
