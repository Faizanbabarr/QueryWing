"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  MessageCircle, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth/login', { 
        method: 'POST', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({ email, password }) 
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data?.error || 'Login failed')
      
      // Persist user data for client-side dashboard auth check
      try {
        const userForClient = {
          id: data.user?.id,
          name: data.user?.name || email.split('@')[0],
          email: data.user?.email || email,
          role: data.user?.role,
          tenantId: data.user?.tenantId,
          tenant: data.user?.tenant,
          isAuthenticated: true,
          createdAt: new Date().toISOString()
        }
        localStorage.setItem('querywing-user', JSON.stringify(userForClient))
        localStorage.setItem('querywing-session', data.sessionToken)
      } catch {}
      
      window.location.href = '/dashboard'
    } catch (e: any) { 
      setError(e.message || 'Login failed') 
    } finally { 
      setLoading(false) 
    }
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
          {/* Welcome Card */}
          <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
              <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Welcome Back!</h1>
                <p className="text-blue-100">Sign in to your account</p>
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

                <div className={`space-y-2 transition-all duration-500 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  <label className="block text-sm font-semibold text-gray-700">Password</label>
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
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Sign In
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>

              <div className={`mt-8 space-y-4 text-center transition-all duration-500 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div>
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="text-gray-600">
                  Don't have an account?{' '}
                  <Link 
                    href="/auth/sign-up" 
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
                  >
                    Sign up here
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Preview */}
          <div className={`mt-8 text-center transition-all duration-500 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>AI-Powered Chatbots</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Lead Generation</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


