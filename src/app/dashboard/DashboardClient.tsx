"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  Users, 
  TrendingUp, 
  Clock, 
  Bot, 
  FileText,
  Settings,
  Plus,
  LogOut,
  User
} from 'lucide-react'
import Link from 'next/link'

interface UserData {
  id: string
  name: string
  email: string
  phone: string
  country: string
  isAuthenticated: boolean
  createdAt: string
}

export default function DashboardClient() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for demo user in localStorage
    const userData = localStorage.getItem('querywing-user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        if (parsedUser.isAuthenticated) {
          setUser(parsedUser)
          setLoading(false)
          return
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    
    // If no demo user, check if we're in a Clerk callback or verification flow
    // For now, let's allow access and show a default dashboard
    // In production, you'd check Clerk auth here
    setUser({
      id: 'default-user',
      name: 'Welcome',
      email: 'user@example.com',
      phone: '',
      country: 'US',
      isAuthenticated: true,
      createdAt: new Date().toISOString()
    })
    setLoading(false)
  }, [router])

  const handleSignOut = () => {
    localStorage.removeItem('querywing-user')
    router.push('/auth/sign-in')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Mock data - in production, fetch from database based on user.id
  const stats = {
    conversations: Math.floor(Math.random() * 1000) + 100,
    leads: Math.floor(Math.random() * 100) + 10,
    deflectionRate: Math.floor(Math.random() * 20) + 70,
    avgResponseTime: (Math.random() * 3 + 1).toFixed(1),
    activeBots: Math.floor(Math.random() * 3) + 1,
    documents: Math.floor(Math.random() * 200) + 50
  }

  const recentConversations = [
    {
      id: '1',
      visitor: 'Anonymous',
      message: 'How do I reset my password?',
      time: '2 minutes ago',
      status: 'resolved'
    },
    {
      id: '2',
      visitor: 'john@example.com',
      message: 'What are your pricing plans?',
      time: '15 minutes ago',
      status: 'lead-captured'
    },
    {
      id: '3',
      visitor: 'Anonymous',
      message: 'Is there a mobile app?',
      time: '1 hour ago',
      status: 'resolved'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-neutral-900">QueryWing</span>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="/dashboard" className="text-primary font-medium">Dashboard</Link>
            <Link href="/dashboard/bots" className="text-neutral-600 hover:text-neutral-900">Bots</Link>
            <Link href="/dashboard/content" className="text-neutral-600 hover:text-neutral-900">Content</Link>
            <Link href="/dashboard/leads" className="text-neutral-600 hover:text-neutral-900">Leads</Link>
            <Link href="/dashboard/analytics" className="text-neutral-600 hover:text-neutral-900">Analytics</Link>
            <Link href="/dashboard/settings" className="text-neutral-600 hover:text-neutral-900">Settings</Link>
            
            {/* Demo User Menu */}
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
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Welcome back, {user.name}!</h1>
          <p className="text-neutral-600">Here's what's happening with your AI assistants today.</p>
          <div className="mt-2 text-sm text-gray-500">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card className="card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversations</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversations.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Captured</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.leads}</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deflection Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.deflectionRate}%</div>
              <p className="text-xs text-muted-foreground">
                +5% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgResponseTime}s</div>
              <p className="text-xs text-muted-foreground">
                -0.3s from last month
              </p>
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeBots}</div>
              <p className="text-xs text-muted-foreground">
                All running smoothly
              </p>
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.documents}</div>
              <p className="text-xs text-muted-foreground">
                +23 this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/dashboard/bots">
            <Card className="card hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Create Bot</CardTitle>
                </div>
                <CardDescription>
                  Set up a new AI assistant for your website
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/content">
            <Card className="card hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Add Content</CardTitle>
                </div>
                <CardDescription>
                  Upload documents or crawl your website
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/bots">
            <Card className="card hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Configure</CardTitle>
                </div>
                <CardDescription>
                  Customize bot behavior and styling
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/analytics">
            <Card className="card hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">View Analytics</CardTitle>
                </div>
                <CardDescription>
                  Detailed insights and performance metrics
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="card">
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
              <CardDescription>
                Latest customer interactions with your bots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentConversations.map((conversation) => (
                  <div key={conversation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{conversation.visitor}</p>
                      <p className="text-sm text-gray-600 truncate">{conversation.message}</p>
                      <p className="text-xs text-gray-500">{conversation.time}</p>
                    </div>
                    <Badge 
                      variant={conversation.status === 'resolved' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {conversation.status === 'resolved' ? 'Resolved' : 'Lead Captured'}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  View All Conversations
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader>
              <CardTitle>Popular Questions</CardTitle>
              <CardDescription>
                Most frequently asked questions this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">How do I reset my password?</span>
                  <Badge variant="outline">47 times</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">What are your pricing plans?</span>
                  <Badge variant="outline">32 times</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Is there a mobile app available?</span>
                  <Badge variant="outline">28 times</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">How do I contact support?</span>
                  <Badge variant="outline">24 times</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">What payment methods do you accept?</span>
                  <Badge variant="outline">19 times</Badge>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  View Full Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
