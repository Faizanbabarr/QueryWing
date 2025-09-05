"use client"
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  MessageCircle, 
  Sparkles, 
  ArrowRight,
  Shield,
  Clock,
  Key
} from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)
  const [email, setEmail] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  
  const params = useSearchParams()
  const router = useRouter()

  const token = params.get('token') || ''
  const emailParam = params.get('email') || ''

  useEffect(() => {
    setIsVisible(true)
    
    // Validate reset token
    const validateToken = () => {
      try {
        const raw = localStorage.getItem('querywing-reset')
        if (!raw && !emailParam) {
          setError('Invalid reset link. Please request a new password reset.')
          return
        }

        let resetData
        if (raw) {
          resetData = JSON.parse(raw)
        } else {
          // For direct links, create temporary reset data
          resetData = { token, email: emailParam, expiresAt: Date.now() + 24 * 60 * 60 * 1000 } // 24 hours
        }

        if (resetData.token !== token) {
          setError('Invalid reset token. Please request a new password reset.')
          return
        }

        if (Date.now() > resetData.expiresAt) {
          setError('Reset link has expired. Please request a new password reset.')
          return
        }

        setEmail(resetData.email)
        setTokenValid(true)
      } catch (error) {
        setError('Invalid reset link. Please request a new password reset.')
      }
    }

    validateToken()
  }, [token, emailParam])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate password
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.')
        return
      }

      if (password !== confirm) {
        setError('Passwords do not match.')
        return
      }

      // Call API to reset password
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to reset password')
        return
      }

      // Clean up reset token
      localStorage.removeItem('querywing-reset')
      
      setSuccess(true)
      setTimeout(() => router.push('/auth/sign-in'), 2000)
      
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
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
                <h1 className="text-2xl font-bold mb-2">Password Reset!</h1>
                <p className="text-green-100">Your password has been updated</p>
              </div>

              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Success!</h2>
                <p className="text-gray-600 mb-6">
                  Your password has been successfully reset. You can now sign in with your new password.
                </p>

                <div className="space-y-4">
                  <Link href="/auth/sign-in">
                    <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Sign In Now
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
                    <span>Redirecting to sign in page in 2 seconds...</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-red-50 to-pink-100">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <div className="absolute top-8 left-8 z-20">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              QueryWing
            </span>
          </Link>
        </div>

        <div className="container mx-auto px-4 py-10 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md">
            <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Invalid Reset Link</h1>
                <p className="text-red-100">This link is not valid or has expired</p>
              </div>

              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Link Expired or Invalid</h2>
                <p className="text-gray-600 mb-6">
                  {error || 'This password reset link is no longer valid. Please request a new one.'}
                </p>

                <div className="space-y-4">
                  <Link href="/auth/forgot-password">
                    <Button className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white">
                      <Key className="w-4 h-4 mr-2" />
                      Request New Reset Link
                    </Button>
                  </Link>
                  
                  <Link href="/auth/sign-in">
                    <Button variant="outline" className="w-full">
                      Back to Sign In
                    </Button>
                  </Link>
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
          {/* Reset Password Card */}
          <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
              <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Reset Your Password</h1>
                <p className="text-blue-100">Create a new secure password</p>
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
                  <label className="block text-sm font-semibold text-gray-700">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10 border-2 border-gray-200 focus:border-blue-500 transition-colors duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
                </div>

                <div className={`space-y-2 transition-all duration-500 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  <label className="block text-sm font-semibold text-gray-700">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10 border-2 border-gray-200 focus:border-blue-500 transition-colors duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className={`transition-all duration-500 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Resetting Password...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Reset Password
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>

              <div className={`mt-8 space-y-4 text-center transition-all duration-500 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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
          <div className={`mt-8 text-center transition-all duration-500 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>Strong password required</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>Link expires in 15 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


