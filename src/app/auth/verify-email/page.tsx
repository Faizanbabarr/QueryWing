"use client"
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  MessageCircle, 
  Sparkles, 
  ArrowRight,
  Shield,
  Clock
} from 'lucide-react'

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('')
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  
  const params = useSearchParams()
  const router = useRouter()

  const token = params.get('token')
  const emailParam = params.get('email')

  useEffect(() => {
    setIsVisible(true)
    
    if (emailParam) {
      setEmail(emailParam)
    }

    // If we have a token, verify it automatically
    if (token && emailParam) {
      verifyEmail(token, emailParam)
    }
  }, [token, emailParam])

  const verifyEmail = async (verificationToken: string, userEmail: string) => {
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch(`/api/auth/email/verify?token=${verificationToken}&email=${encodeURIComponent(userEmail)}`)
      const data = await res.json()
      
      if (res.ok) {
        setVerified(true)
        setMessage('Email verified successfully! You can now log in to your account.')
        
        // Clear pending email
        localStorage.removeItem('pending-email')
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/sign-in')
        }, 3000)
      } else {
        setError(data.error || 'Verification failed')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setError('Failed to verify email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resendVerification = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setResending(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setMessage('Verification email sent successfully! Please check your inbox.')
      } else {
        setError(data.error || 'Failed to send verification email')
      }
    } catch (error) {
      console.error('Resend error:', error)
      setError('Failed to send verification email. Please try again.')
    } finally {
      setResending(false)
    }
  }

  if (verified) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <div className="absolute top-8 left-8 z-20">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              QueryWing
            </span>
          </Link>
        </div>

        <div className="container mx-auto px-4 py-10 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md">
            <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
                <p className="text-green-100">Your account is now active</p>
              </div>

              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to QueryWing!</h2>
                <p className="text-gray-600 mb-6">
                  Your email has been successfully verified. You can now access all features of your account.
                </p>

                <div className="space-y-4">
                  <Link href="/auth/sign-in">
                    <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Sign In to Your Account
                    </Button>
                  </Link>
                  
                  <Link href="/">
                    <Button variant="outline" className="w-full">
                      Go to Homepage
                    </Button>
                  </Link>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-blue-700">
                    <Clock className="w-4 h-4" />
                    <span>Redirecting to sign in page in 3 seconds...</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            QueryWing
          </span>
        </Link>
      </div>

      <div className="container mx-auto px-4 py-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          {/* Verify Email Card */}
          <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white text-center">
              <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
                <p className="text-purple-100">Complete your account setup</p>
              </div>
            </div>

            <CardContent className="p-8">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Verifying your email...</p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                      <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-red-700">{error}</span>
                      </div>
                    </div>
                  )}

                  {message && (
                    <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                      <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-6">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-green-700">{message}</span>
                      </div>
                    </div>
                  )}

                  <div className={`space-y-6 transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-10 h-10 text-purple-600" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">Check Your Email</h2>
                      <p className="text-gray-600">
                        We've sent a verification link to <strong>{email || 'your email'}</strong>
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="you@example.com"
                            className="pl-10 border-2 border-gray-200 focus:border-purple-500 transition-colors duration-200"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={resendVerification}
                        disabled={resending || !email.trim()}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {resending ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Resend Verification Email
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className={`mt-8 space-y-4 text-center transition-all duration-500 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="text-gray-600">
                      Already verified?{' '}
                      <Link 
                        href="/auth/sign-in" 
                        className="text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200"
                      >
                        Sign in here
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Help Info */}
          <div className={`mt-8 text-center transition-all duration-500 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-4 h-4 text-purple-500" />
                <span>Check spam folder</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-4 h-4 text-pink-500" />
                <span>Link expires in 24h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


