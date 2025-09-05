import { NextRequest, NextResponse } from 'next/server'

const STRIPE_API = 'https://api.stripe.com/v1'

function form(data: Record<string, string>) {
  return Object.entries(data)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { plan = 'starter', email } = body || {}
    
    // Handle free starter plan
    if (plan === 'starter') {
      // For free plan, create account directly without Stripe
      const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || ''
      return NextResponse.json({ 
        url: `${origin}/checkout/success?plan=starter&email=${encodeURIComponent(email || '')}`,
        isFree: true
      })
    }
    
    const secret = process.env.STRIPE_SECRET_KEY
    
    if (!secret) {
      return NextResponse.json({ 
        error: 'Stripe not configured. Please set STRIPE_SECRET_KEY environment variable.' 
      }, { status: 400 })
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || ''
    
    // Define price IDs with fallbacks for testing
    const priceMap: Record<string, string> = {
      growth: process.env.STRIPE_PRICE_GROWTH || 'price_REDACTED',
      scale: process.env.STRIPE_PRICE_SCALE || 'price_REDACTED'
    }
    
    const price = priceMap[String(plan).toLowerCase()]
    
    if (!price) {
      return NextResponse.json({ 
        error: 'Missing Stripe price ID environment variables. Please set STRIPE_PRICE_GROWTH and STRIPE_PRICE_SCALE.' 
      }, { status: 400 })
    }

    const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: form({
        mode: 'subscription',
        'line_items[0][price]': price,
        'line_items[0][quantity]': '1',
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing`,
        ...(email ? { customer_email: email } : {})
      })
    })
    
    const data = await res.json()
    
    if (!res.ok) {
      console.error('Stripe API error:', data)
      return NextResponse.json({ 
        error: data.error?.message || 'Failed to create Stripe checkout session' 
      }, { status: 400 })
    }
    
    return NextResponse.json({ url: data.url })
  } catch (e) {
    console.error('Checkout session error:', e)
    return NextResponse.json({ 
      error: 'Failed to create checkout session. Please try again.' 
    }, { status: 500 })
  }
}

// Retrieve a checkout session
export async function GET(req: NextRequest) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY
    if (!secret) {
      return NextResponse.json({ 
        error: 'Stripe not configured. Please set STRIPE_SECRET_KEY environment variable.' 
      }, { status: 400 })
    }
    
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      return NextResponse.json({ 
        error: 'session_id required' 
      }, { status: 400 })
    }
    
    const res = await fetch(`${STRIPE_API}/checkout/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${secret}` }
    })
    
    const data = await res.json()
    
    if (!res.ok) {
      console.error('Stripe session retrieval error:', data)
      return NextResponse.json({ 
        error: data.error?.message || 'Failed to retrieve session' 
      }, { status: 400 })
    }
    
    return NextResponse.json(data)
  } catch (e) {
    console.error('Session retrieval error:', e)
    return NextResponse.json({ 
      error: 'Failed to retrieve session. Please try again.' 
    }, { status: 500 })
  }
}


