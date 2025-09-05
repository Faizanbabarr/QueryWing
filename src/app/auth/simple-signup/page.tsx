"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function SimpleSignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    country: 'PK'
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const countries = [
    { code: 'PK', name: 'Pakistan (+92)' },
    { code: 'US', name: 'United States (+1)' },
    { code: 'GB', name: 'United Kingdom (+44)' },
    { code: 'CA', name: 'Canada (+1)' },
    { code: 'AU', name: 'Australia (+61)' },
    { code: 'IN', name: 'India (+91)' },
    { code: 'DE', name: 'Germany (+49)' },
    { code: 'FR', name: 'France (+33)' },
    { code: 'JP', name: 'Japan (+81)' },
    { code: 'BR', name: 'Brazil (+55)' },
  ]

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Basic validation
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long')
      setLoading(false)
      return
    }
    
    // Store user data in localStorage for demo purposes
    const userData = {
      id: 'demo-user-' + Date.now(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      password: formData.password, // Store password for sign-in
      isAuthenticated: true,
      createdAt: new Date().toISOString()
    }
    
    localStorage.setItem('querywing-user', JSON.stringify(userData))
    
    // Show success message and redirect
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <p className="text-gray-600">Get started with QueryWing</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number (Optional)</label>
              <div className="flex gap-2">
                <select
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Phone number"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">All countries supported - no restrictions!</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Create a password"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/sign-in" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
