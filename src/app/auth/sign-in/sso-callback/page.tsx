"use client"
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function SSOCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [countdown, setCountdown] = useState(3)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get the redirect URL from query params
    const afterSignInUrl = searchParams.get('after_sign_in_url') || '/dashboard'
    const afterSignUpUrl = searchParams.get('after_sign_up_url') || '/dashboard'
    
    // Simulate SSO callback processing
    const timer = setTimeout(() => {
      setStatus('success')
      
      // Start countdown to redirect
      const countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer)
            // Redirect to the appropriate URL
            const redirectUrl = afterSignInUrl || afterSignUpUrl || '/dashboard'
            router.push(redirectUrl)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(countdownTimer)
    }, 2000)

    return () => clearTimeout(timer)
  }, [router, searchParams])

  const handleManualRedirect = () => {
    const afterSignInUrl = searchParams.get('after_sign_in_url') || '/dashboard'
    const afterSignUpUrl = searchParams.get('after_sign_up_url') || '/dashboard'
    const redirectUrl = afterSignInUrl || afterSignUpUrl || '/dashboard'
    router.push(redirectUrl)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === 'loading' && 'Processing Sign In...'}
            {status === 'success' && 'Successfully Signed In!'}
            {status === 'error' && 'Sign In Failed'}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {status === 'loading' && 'Please wait while we complete your sign in.'}
            {status === 'success' && 'Your sign in was successful. Redirecting to dashboard...'}
            {status === 'error' && 'There was an issue with your sign in. Please try again.'}
          </p>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'loading' && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-500">Completing authentication...</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  ✅ You have been successfully signed in!
                </p>
              </div>
              <div className="text-sm text-gray-600">
                Redirecting to your dashboard in {countdown} seconds...
              </div>
              <Button 
                onClick={handleManualRedirect}
                className="w-full"
              >
                Go to Dashboard Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">
                  ❌ There was an issue with your sign in. Please try again.
                </p>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Try Again
                </Button>
                <Link href="/auth/sign-in">
                  <Button variant="outline" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
