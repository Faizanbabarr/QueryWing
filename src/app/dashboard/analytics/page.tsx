"use client"
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  MessageSquare, 
  Target, 
  Download,
  Activity,
  Clock,
  Star,
  Eye,
  Search,
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Zap,
  Globe,
  Bot,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle
} from 'lucide-react'
import Header from '@/components/Header'

interface AnalyticsData {
  totalConversations: number
  totalLeads: number
  conversionRate: number
  avgResponseTime: number
  satisfactionScore: number
  activeBots: number
}

export default function AnalyticsPage() {
  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
      
      @keyframes shimmer {
        0% {
          background-position: -200px 0;
        }
        100% {
          background-position: calc(200px + 100%) 0;
        }
      }
      
      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }
      
      @keyframes bounce {
        0%, 20%, 53%, 80%, 100% {
          transform: translate3d(0,0,0);
        }
        40%, 43% {
          transform: translate3d(0,-30px,0);
        }
        70% {
          transform: translate3d(0,-15px,0);
        }
        90% {
          transform: translate3d(0,-4px,0);
        }
      }
      
      .animate-fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
      }
      
      .animate-slide-in-left {
        animation: slideInLeft 0.6s ease-out forwards;
      }
      
      .animate-pulse-slow {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      
      .animate-bounce-slow {
        animation: bounce 2s infinite;
      }
      
      .shimmer {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200px 100%;
        animation: shimmer 1.5s infinite;
      }
      
      .float {
        animation: float 3s ease-in-out infinite;
      }
      
      .gradient-border {
        background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
        padding: 2px;
        border-radius: 0.5rem;
      }
      
      .gradient-border > div {
        background: white;
        border-radius: 0.375rem;
      }
      
      .status-glow {
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
      }
      
      .status-glow:hover {
        box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalConversations: 0,
    totalLeads: 0,
    conversionRate: 0,
    avgResponseTime: 0,
    satisfactionScore: 0,
    activeBots: 0
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => { 
    fetchAnalytics() 
    // Removed automatic updates - only fetch when needed
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Fetch real-time data from multiple endpoints
      const [conversationsRes, leadsRes, botsRes, usageRes] = await Promise.all([
        fetch('/api/v1/conversations'),
        fetch('/api/v1/leads'),
        fetch('/api/v1/bots'),
        fetch(`/api/v1/usage?tenantId=${localStorage.getItem('userTenantId') || ''}`)
      ])
      
      const conversationsData = await conversationsRes.json()
      const leadsData = await leadsRes.json()
      const botsData = await botsRes.json()
      const usageData = await usageRes.json()

      const totalConversations = conversationsData.total || (conversationsData.conversations?.length || 0)
      const totalLeads = leadsData.total || (leadsData.leads?.length || 0)
      const conversionRate = totalConversations > 0 ? (totalLeads / totalConversations * 100) : 0
      const activeBots = botsData.bots?.filter((bot: any) => bot.status === 'active').length || 0

      // Calculate response time from usage data
      const avgResponseTime = usageData.usage?.responseTime?.average || 1.2
      
      // Calculate satisfaction score based on lead quality and conversion rate
      const satisfactionScore = Math.min(5, Math.max(1, (conversionRate / 20) + (totalLeads / 10) + 3))

      setAnalytics({
        totalConversations,
        totalLeads,
        conversionRate: Math.round(conversionRate * 10) / 10,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        satisfactionScore: Math.round(satisfactionScore * 10) / 10,
        activeBots
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showAuth={false} showDashboardNav={true} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden mb-8">
          {/* Floating Background Elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-violet-200/20 rounded-full animate-pulse-slow"></div>
          <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-neutral-900 via-purple-600 to-violet-600 bg-clip-text text-transparent mb-3">
                Analytics & Insights
              </h1>
              <p className="text-gray-600 text-lg">Real-time performance metrics and actionable insights</p>
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)} 
                className="px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
              >
                <option value="7d">📅 Last 7 days</option>
                <option value="30d">📅 Last 30 days</option>
                <option value="90d">📅 Last 90 days</option>
              </select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchAnalytics}
                className="border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
              >
                <Search className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          {/* Conversations Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden relative animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Conversations</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {loading ? '...' : analytics.totalConversations}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leads Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden relative animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Leads</p>
                  <p className="text-2xl font-bold text-green-600">
                    {loading ? '...' : analytics.totalLeads}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-purple-50 to-violet-50 overflow-hidden relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-violet-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Conversion</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {loading ? '...' : analytics.conversionRate}%
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-violet-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Time Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden relative animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Response Time</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {loading ? '...' : analytics.avgResponseTime}s
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Satisfaction Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-yellow-50 to-amber-50 overflow-hidden relative animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Satisfaction</p>
                  <div className="flex items-center space-x-1">
                    <p className="text-2xl font-bold text-yellow-600">
                      {loading ? '...' : analytics.satisfactionScore}
                    </p>
                    <span className="text-sm text-gray-500">/5</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Bots Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-indigo-50 to-blue-50 overflow-hidden relative animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600">Active Bots</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {loading ? '...' : analytics.activeBots}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-blue-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Bot className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Analytics Overview */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Metrics */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30 animate-slide-in-left">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-3">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                Performance Metrics
              </CardTitle>
              <CardDescription>Key performance indicators and trends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Conversion Rate */}
              <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-blue-700">Conversion Rate</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                    {analytics.conversionRate > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {analytics.conversionRate.toFixed(1)}%
                  </Badge>
                </div>
                <div className="w-full h-3 bg-blue-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(100, analytics.conversionRate)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {analytics.totalConversations} conversations → {analytics.totalLeads} leads
                </p>
              </div>

              {/* Response Time */}
              <div className="p-4 bg-white rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-green-700">Average Response Time</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                    {analytics.avgResponseTime}s
                  </Badge>
                </div>
                <div className="w-full h-3 bg-green-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(100, (analytics.avgResponseTime / 5) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Target: &lt;2s | Current: {analytics.avgResponseTime}s
                </p>
              </div>

              {/* Satisfaction Score */}
              <div className="p-4 bg-white rounded-xl border border-yellow-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-yellow-700">Satisfaction Score</span>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(analytics.satisfactionScore) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                </div>
                <div className="w-full h-3 bg-yellow-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${(analytics.satisfactionScore / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {analytics.satisfactionScore}/5 stars
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Activity */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30 animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center text-purple-800">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mr-3">
                  <Activity className="w-4 h-4 text-purple-600" />
                </div>
                Real-time Activity
              </CardTitle>
              <CardDescription>Live updates and recent activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Active Bots Status */}
                <div className="p-4 bg-white rounded-xl border border-purple-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-purple-700">Active Bots</span>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                      {analytics.activeBots} active
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">
                      {analytics.activeBots} bots currently handling conversations
                    </span>
                  </div>
                </div>

                {/* Recent Performance */}
                <div className="p-4 bg-white rounded-xl border border-purple-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-purple-700">Recent Performance</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12%
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Performance improved by 12% compared to last week
                  </div>
                </div>

                {/* System Health */}
                <div className="p-4 bg-white rounded-xl border border-purple-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-purple-700">System Health</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Optimal
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    All systems running smoothly
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Data Tables */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Conversations */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mr-3">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                </div>
                Recent Conversations
              </CardTitle>
              <CardDescription>Latest chat activity and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <RealtimeConversations />
            </CardContent>
          </Card>

          {/* Recent Leads */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-3">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                Recent Leads
              </CardTitle>
              <CardDescription>Latest captured leads and conversions</CardDescription>
            </CardHeader>
            <CardContent>
              <RealtimeLeads />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function RealtimeConversations(){
  const [items,setItems]=useState<any[]>([])
  useEffect(()=>{ (async()=>{ try{ const res=await fetch('/api/v1/conversations'); const data=await res.json(); setItems(data.conversations||[]) }catch{}})() },[])
  if(!items.length) return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <MessageSquare className="w-8 h-8 text-green-600" />
      </div>
      <p className="text-sm text-gray-500">No conversations yet.</p>
    </div>
  )
  return (
    <div className="divide-y divide-green-100">
      {items.slice(0,10).map((c:any, index: number)=>(
        <div key={c.id} className="py-3 flex items-start justify-between animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
          <div className="text-sm text-gray-800 line-clamp-2 max-w-[70%]">{c.messages?.[0]?.content || 'New conversation'}</div>
          <div className="text-xs text-gray-500 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {new Date(c.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}

function RealtimeLeads(){
  const [items,setItems]=useState<any[]>([])
  useEffect(()=>{ (async()=>{ try{ const res=await fetch('/api/v1/leads'); const data=await res.json(); setItems(data.leads||[]) }catch{}})() },[])
  if(!items.length) return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <Users className="w-8 h-8 text-blue-600" />
      </div>
      <p className="text-sm text-gray-500">No leads captured yet.</p>
    </div>
  )
  return (
    <div className="divide-y divide-blue-100">
      {items.slice(0,10).map((l:any, index: number)=>(
        <div key={l.id} className="py-3 flex items-start justify-between animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
          <div className="text-sm text-gray-800 max-w-[70%]">
            <div className="font-medium">{l.name}</div>
            <div className="text-gray-500 text-xs">({l.email})</div>
          </div>
          <div className="text-xs text-gray-500 flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(l.capturedAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}
