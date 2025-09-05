"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  MessageCircle, 
  Sparkles, 
  ArrowLeft,
  Shield,
  RefreshCw
} from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address')
        return
      }

      // Check if user exists in database via API
      try {
        console.log('[forgot-password] Checking if user exists for email:', email)
        
        const checkRes = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        
        console.log('[forgot-password] Check email response status:', checkRes.status)
        
        if (!checkRes.ok) {
          const checkData = await checkRes.json()
          console.log('[forgot-password] Check email error data:', checkData)
          
          if (checkData.error === 'USER_NOT_FOUND') {
            setError('No account found for this email address')
            return
          }
          // If it's another error, continue with the reset process
        } else {
          const checkData = await checkRes.json()
          console.log('[forgot-password] Check email success data:', checkData)
        }
      } catch (checkError) {
        console.log('Email check failed, continuing with reset process:', checkError)
        // Continue with reset process even if check fails
      }

      // Request server to send email
      const res = await fetch('/api/auth/email/reset', { 
        method: 'POST', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({ email }) 
      })
      
      const data = await res.json()
      
      if (!res.ok) { 
        setError(data?.error || 'Failed to send reset email') 
        return 
      }

      if (!data?.token) { 
        setError('Invalid response from server') 
        return 
      }

      // Persist token in local storage to allow reset flow
      const reset = { 
        token: data.token, 
        email, 
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours (matches backend)
      }
      localStorage.setItem('querywing-reset', JSON.stringify(reset))
      
      setSent(true)
      setMessage(data.message || 'Password reset email sent successfully!')
      
    } catch (error) {
      console.error('Password reset error:', error)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
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
                <h1 className="text-2xl font-bold mb-2">Check Your Email!</h1>
                <p className="text-green-100">We've sent you a password reset link</p>
              </div>

              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-10 h-10 text-green-600" />
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Reset Link Sent</h2>
                <p className="text-gray-600 mb-6">
                  We've sent a password reset link to <strong>{email}</strong>. 
                  Please check your email and click the link to reset your password.
                </p>

                <div className="space-y-4">
                  <Button
                    onClick={() => {
                      setSent(false)
                      setEmail('')
                      setMessage('')
                    }}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Send Another Email
                  </Button>
                  
                  <Link href="/auth/sign-in">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Sign In
                    </Button>
                  </Link>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-blue-700">
                    <Shield className="w-4 h-4" />
                    <span>Can't find the email? Check your spam folder</span>
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            QueryWing
          </span>
        </Link>
      </div>

      <div className="container mx-auto px-4 py-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          {/* Forgot Password Card */}
          <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
              <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Forgot Password?</h1>
                <p className="text-blue-100">No worries, we'll help you reset it</p>
              </div>
            </div>

            <CardContent className="p-8">
              <form onSubmit={submit} className="space-y-6">
                {error && (
                  <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  </div>
                )}

                <div className={`space-y-2 transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 border-2 border-gray-200 focus:border-blue-500 transition-colors duration-200"
                      required
                    />
                  </div>
                </div>

                <div className={`transition-all duration-500 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending Reset Link...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Send Reset Link
                        <Mail className="w-4 h-4 ml-2" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>

              <div className={`mt-8 space-y-4 text-center transition-all duration-500 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="text-gray-600">
                  Remember your password?{' '}
                  <Link 
                    href="/auth/sign-in" 
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
                  >
                    Sign in here
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Info */}
          <div className={`mt-8 text-center transition-all duration-500 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>Your password reset link will expire in 15 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


