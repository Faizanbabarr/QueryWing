import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

export async function POST(request: NextRequest) {
  try {
    const { addonType, quantity, tenantId } = await request.json()

    if (!addonType || !quantity || !tenantId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Define add-on pricing
    const addonPricing = {
      credits: { price: 0.15, name: 'Bot Credits' },
      bots: { price: 19, name: 'Additional Bots' },
      agents: { price: 40, name: 'Live Agents' }
    }

    const pricing = addonPricing[addonType as keyof typeof addonPricing]
    if (!pricing) {
      return NextResponse.json(
        { error: 'Invalid addon type' },
        { status: 400 }
      )
    }

    // Calculate total amount in cents
    const totalAmount = Math.round(pricing.price * quantity * 100)

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_REDACTED: {
            currency: 'usd',
            product_data: {
              name: `${pricing.name} - ${quantity} ${addonType === 'credits' ? 'credits' : addonType === 'bots' ? 'bots' : 'agents'}`,
              description: `Add-on purchase for tenant ${tenantId}`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=true&addon=${addonType}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?canceled=true`,
      metadata: {
        tenantId,
        addonType,
        quantity: quantity.toString(),
        totalAmount: totalAmount.toString()
      }
    })

    return NextResponse.json({
      checkoutUrl: session.url
    })

  } catch (error) {
    console.error('Error creating addon checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
