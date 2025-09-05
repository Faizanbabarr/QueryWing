"use client"
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function VerificationPage() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [countdown, setCountdown] = useState(3)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    // Simulate verification process
    const timer = setTimeout(() => {
      setVerificationStatus('success')
      
      // Start countdown to redirect
      const countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer)
            // Redirect to dashboard
            router.push('/dashboard')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(countdownTimer)
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  const handleManualRedirect = () => {
    router.push('/dashboard')
  }

  const getVerificationType = () => {
    const path = Array.isArray(params.verification) ? params.verification.join('/') : params.verification || ''
    if (path.includes('email')) return 'Email'
    if (path.includes('phone')) return 'Phone'
    if (path.includes('factor')) return 'Two-Factor'
    return 'Account'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {verificationStatus === 'loading' && (
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            )}
            {verificationStatus === 'success' && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            )}
            {verificationStatus === 'error' && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {verificationStatus === 'loading' && `Verifying ${getVerificationType()}...`}
            {verificationStatus === 'success' && `${getVerificationType()} Verified!`}
            {verificationStatus === 'error' && 'Verification Failed'}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {verificationStatus === 'loading' && `Please wait while we verify your ${getVerificationType().toLowerCase()}.`}
            {verificationStatus === 'success' && `Your ${getVerificationType().toLowerCase()} has been successfully verified. Redirecting to dashboard...`}
            {verificationStatus === 'error' && `There was an issue verifying your ${getVerificationType().toLowerCase()}. Please try again.`}
          </p>
        </CardHeader>
        <CardContent className="text-center">
          {verificationStatus === 'loading' && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-500">Processing verification...</p>
            </div>
          )}
          
          {verificationStatus === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  ✅ Your {getVerificationType().toLowerCase()} has been successfully verified!
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
          
          {verificationStatus === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">
                  ❌ There was an issue with {getVerificationType().toLowerCase()} verification. Please try again.
                </p>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Try Again
                </Button>
                <Link href="/auth/simple-signup">
                  <Button variant="outline" className="w-full">
                    Use Simple Signup Instead
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
