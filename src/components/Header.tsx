"use client"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Bot, User, LogOut, LayoutDashboard } from 'lucide-react'
import { useState, useEffect } from 'react'

interface UserData {
  id: string
  name: string
  email: string
  phone: string
  country: string
  isAuthenticated: boolean
  createdAt: string
}

interface HeaderProps {
  currentPage?: string
  showAuth?: boolean
  showDashboardNav?: boolean
}

export default function Header({ currentPage, showAuth = true, showDashboardNav = false }: HeaderProps) {
  const [user, setUser] = useState<UserData | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Check for authenticated user
    const userData = localStorage.getItem('querywing-user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }

    // If no user stored but a session exists, validate and show Dashboard entry
    ;(async () => {
      try {
        if (!user) {
          const token = localStorage.getItem('querywing-session')
          if (token) {
            const res = await fetch(`/api/auth/session?token=${encodeURIComponent(token)}`)
            if (res.ok) {
              setUser({
                id: 'session',
                name: 'Account',
                email: '',
                phone: '',
                country: '',
                isAuthenticated: true,
                createdAt: new Date().toISOString()
              })
            }
          }
        }
      } catch {}
    })()

    // Simulate online status
    const interval = setInterval(() => {
      setIsOnline(Math.random() > 0.1) // 90% chance of being online
    }, 30000)

    // Idle auto-logout based on saved session timeout
    let inactivityTimer: number | undefined
    const signOutNow = () => {
      try { localStorage.removeItem('querywing-user') } catch {}
      window.location.href = '/auth/sign-in'
    }
    const resetInactivity = () => {
      if (inactivityTimer) window.clearTimeout(inactivityTimer)
      const minsStr = localStorage.getItem('querywing-session-timeout-mins') || '0'
      const mins = parseInt(minsStr)
      if (!mins || isNaN(mins)) return
      inactivityTimer = window.setTimeout(signOutNow, mins * 60 * 1000)
    }
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    activityEvents.forEach((ev) => window.addEventListener(ev, resetInactivity))
    resetInactivity()

    return () => clearInterval(interval)
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('querywing-user')
    window.location.href = '/auth/sign-in'
  }

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo and App Name - Always links to home */}
        <Link href={user ? '/dashboard' : '/'} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-neutral-900">QueryWing</span>
          {user && (
            <div className="flex items-center space-x-2 ml-4">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">{isOnline ? 'Live' : 'Offline'}</span>
            </div>
          )}
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-6">
          {showDashboardNav && user ? (
            // Dashboard Navigation
            <>
              <Link 
                href="/dashboard" 
                className={`transition-colors ${currentPage === 'dashboard' ? 'text-primary font-medium' : 'text-neutral-600 hover:text-neutral-900'}`}
              >
                Dashboard
              </Link>
              <Link 
                href="/dashboard/bots" 
                className={`transition-colors ${currentPage === 'bots' ? 'text-primary font-medium' : 'text-neutral-600 hover:text-neutral-900'}`}
              >
                Bots
              </Link>
              <Link 
                href="/dashboard/content" 
                className={`transition-colors ${currentPage === 'content' ? 'text-primary font-medium' : 'text-neutral-600 hover:text-neutral-900'}`}
              >
                Content
              </Link>
              <Link 
                href="/dashboard/leads" 
                className={`transition-colors ${currentPage === 'leads' ? 'text-primary font-medium' : 'text-neutral-600 hover:text-neutral-900'}`}
              >
                Leads
              </Link>
              <Link 
                href="/dashboard/live" 
                className={`transition-colors ${currentPage === 'live' ? 'text-primary font-medium' : 'text-neutral-600 hover:text-neutral-900'}`}
              >
                Live Chat
              </Link>
              <Link 
                href="/dashboard/analytics" 
                className={`transition-colors ${currentPage === 'analytics' ? 'text-primary font-medium' : 'text-neutral-600 hover:text-neutral-900'}`}
              >
                Analytics
              </Link>
              <Link 
                href="/dashboard/settings" 
                className={`transition-colors ${currentPage === 'settings' ? 'text-primary font-medium' : 'text-neutral-600 hover:text-neutral-900'}`}
              >
                Settings
              </Link>
            </>
          ) : (
            // Public Navigation
            <>
              <Link href="/features" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                Pricing
              </Link>
              <Link href="/docs" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                Docs
              </Link>
              <Link href="/demo" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                Demo
              </Link>
            </>
          )}

          {/* Auth Section */}
          {showAuth && (
            <div className="flex items-center space-x-4">
              {user ? (
                // User Menu with Dashboard Button
                <div className="flex items-center space-x-3">
                  {/* Dashboard Button - Show on public pages when user is logged in */}
                  {!showDashboardNav && (
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" className="flex items-center space-x-2">
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Button>
                    </Link>
                  )}
                  
                  {/* User Menu */}
                  <div className="relative group">
                    <button className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-900">
                      <User className="w-5 h-5" />
                      <span>{user.name}</span>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-gray-500">{user.email}</div>
                        </div>
                        {/* Dashboard link in dropdown for mobile/accessibility */}
                        {!showDashboardNav && (
                          <Link href="/dashboard">
                            <div className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                              <LayoutDashboard className="w-4 h-4" />
                              <span>Dashboard</span>
                            </div>
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Sign In/Sign Up Buttons
                <>
                  <Link href="/auth/sign-in">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button className="btn-primary">Start Free</Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
