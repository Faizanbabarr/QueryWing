"use client"
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Header from '@/components/Header'

export default function CheckoutPage(){
  const search = useSearchParams()
  const router = useRouter()
  const [processing,setProcessing] = useState(false)
  const [error,setError] = useState<string | null>(null)
  const plan = (search.get('plan') || 'starter').toLowerCase()

  const goToStripe = async () => {
    setProcessing(true)
    setError(null)
    try{
      const user = (() => { try { return JSON.parse(localStorage.getItem('querywing-user')||'null') } catch { return null } })()
      const email = user?.email || 'user@example.com'
      const res = await fetch('/api/checkout/session', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ plan, email }) })
      const data = await res.json()
              if (res.ok && data.url) {
          window.location.href = data.url
          return
        }
      const msg = (data && (data.error?.message || data.error || data.message)) || 'Stripe is not configured. Please set STRIPE_SECRET_KEY and price IDs, then restart the server.'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setProcessing(false)
    }
  }

  const getPlanDetails = (plan: string) => {
    switch(plan) {
      case 'starter':
        return '1 bot, 200 messages/mo, 50 leads/mo.'
      case 'growth':
        return 'Up to 5 bots, 5,000 messages/mo, 1,000 leads/mo, live agent support.'
      case 'scale':
        return 'Up to 50 bots, unlimited messages/leads, SLA & SSO, priority support.'
      default:
        return '1 bot, 200 messages/mo, 50 leads/mo.'
    }
  }

  const getPlanPrice = (plan: string) => {
    switch(plan) {
      case 'starter':
        return 'Free'
      case 'growth':
        return '$99/month'
      case 'scale':
        return '$299/month'
      default:
        return 'Free'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showAuth={false} showDashboardNav={false} />
      <div className="container mx-auto px-4 py-16 max-w-xl">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        
        {/* Plan Details */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold capitalize">{plan} Plan</h2>
            <span className="text-2xl font-bold text-purple-600">{getPlanPrice(plan)}</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">{getPlanDetails(plan)}</p>
          
          {/* Features List */}
          <div className="space-y-2">
            {plan === 'starter' && (
              <>
                <div className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  1 AI Chatbot
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  200 messages per month
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  50 leads per month
                </div>
              </>
            )}
            {plan === 'growth' && (
              <>
                <div className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Up to 5 AI Chatbots
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  5,000 messages per month
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  1,000 leads per month
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Live agent support
                </div>
              </>
            )}
            {plan === 'scale' && (
              <>
                <div className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Up to 50 AI Chatbots
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Unlimited messages
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Unlimited leads
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  SLA & SSO included
                </div>
              </>
            )}
          </div>
        </div>

        {/* Payment Button */}
        {plan === 'starter' ? (
          <Button 
            onClick={goToStripe} 
            disabled={processing}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
          >
            {processing ? 'Creating Free Account...' : 'Create Free Account'}
          </Button>
        ) : (
          <Button 
            onClick={goToStripe} 
            disabled={processing}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg"
          >
            {processing ? 'Redirecting to Payment...' : 'Proceed to Payment'}
          </Button>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 mb-2">{error}</p>
            <div className="text-xs text-red-500">
              <p className="mb-1">To fix this issue:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Copy env-template.txt to .env.local</li>
                <li>Get your Stripe keys from <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="underline">Stripe Dashboard</a></li>
                <li>Create products and get price IDs from <a href="https://dashboard.stripe.com/products" target="_blank" rel="noopener noreferrer" className="underline">Stripe Products</a></li>
                <li>Restart your development server</li>
              </ol>
            </div>
          </div>
        )}

        {/* Info Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            After payment, your workspace and a starter bot will be created automatically. 
            You'll get an embed code for any CMS/custom site.
          </p>
        </div>
      </div>
    </div>
  )
}


