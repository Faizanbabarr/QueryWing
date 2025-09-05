"use client"
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Mail, ArrowRight, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmailAddressPage() {
  const [verificationStatus, setVerificationStatus] = useState<'input' | 'loading' | 'success' | 'error'>('input')
  const [verificationCode, setVerificationCode] = useState('')
  const [countdown, setCountdown] = useState(3)
  const [resendCountdown, setResendCountdown] = useState(0)
  const [email, setEmail] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailParam = searchParams.get('email') || ''
    const storedEmail = localStorage.getItem('pending-email') || emailParam
    setEmail(storedEmail)
    
    // Store email for verification
    if (storedEmail) {
      localStorage.setItem('pending-email', storedEmail)
    }
    // Clear any pre-filled codes - user should enter the code from their email
    setVerificationCode('')
  }, [searchParams])

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verificationCode.trim()) return

    setVerificationStatus('loading')
    
    try {
      // Call the verification API
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: verificationCode, // Use the code parameter
          email: email 
        })
      })

      const data = await response.json()

      if (response.ok) {
        setVerificationStatus('success')
        
        // Start countdown to redirect
        const countdownTimer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownTimer)
              // Clear pending email and redirect
              localStorage.removeItem('pending-email')
              router.push('/dashboard')
              return 0
            }
            return prev - 1
          })
        }, 1000)

        return () => clearInterval(countdownTimer)
      } else {
        setVerificationStatus('error')
        console.error('Verification failed:', data.error)
      }
    } catch (error) {
      console.error('Verification error:', error)
      setVerificationStatus('error')
    }
  }

  const handleResendCode = () => {
    setResendCountdown(60) // 60 seconds cooldown
    
    // Request a new verification email
    fetch('/api/auth/email/verify', { 
      method:'POST', 
      headers:{'Content-Type':'application/json'}, 
      body: JSON.stringify({ email }) 
    })
      .then(r => r.json())
      .then(data => {
        if (data?.ok) {
          console.log('New verification email sent')
          // Store verification code for fallback (development mode)
          if (data?.code) {
            localStorage.setItem('pending-verification-code', String(data.code))
          }
        } else {
          console.error('Failed to resend verification email:', data?.error)
        }
      })
      .catch(error => {
        console.error('Resend verification error:', error)
      })
  }

  const handleManualRedirect = () => {
    localStorage.removeItem('pending-email')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <p className="text-gray-600 mt-2">
            We've sent a verification code to <strong>{email}</strong>
          </p>
        </CardHeader>
        <CardContent className="text-center">
          {verificationStatus === 'input' && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-left">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the 6-digit code sent to your email
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={verificationCode.length !== 6}
              >
                Verify Email
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Didn't receive the code?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendCode}
                  disabled={resendCountdown > 0}
                  className="text-sm"
                >
                  {resendCountdown > 0 ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Resend in {resendCountdown}s
                    </>
                  ) : (
                    'Resend Code'
                  )}
                </Button>
              </div>
            </form>
          )}
          
          {verificationStatus === 'loading' && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-500">Verifying your email...</p>
            </div>
          )}
          
          {verificationStatus === 'success' && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  ✅ Your email has been successfully verified!
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
                  ❌ Invalid verification code. Please try again.
                </p>
              </div>
              <Button 
                onClick={() => setVerificationStatus('input')}
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Link href="/auth/simple-signup" className="text-sm text-gray-500 hover:underline">
              Use Simple Signup Instead
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
