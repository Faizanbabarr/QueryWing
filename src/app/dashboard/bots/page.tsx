"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Bot, 
  Plus, 
  Settings, 
  Copy, 
  Trash2, 
  MessageCircle, 
  Users, 
  Globe,
  Power,
  PowerOff,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  Activity,
  Eye,
  Edit,
  MoreHorizontal,
  Zap,
  Target,
  Clock,
  Star,
  Sparkles,
  Brain,
  Cpu,
  BarChart3,
  Play,
  Pause,
  RotateCcw,
  ExternalLink,
  Shield,
  Rocket,
  Lightbulb
} from 'lucide-react'
import Header from '@/components/Header'
import { useToast } from '@/hooks/use-toast'

interface Bot {
  id: string
  name: string
  description: string
  instructions: string
  status: 'active' | 'inactive'
  conversations: number
  leads: number
  createdAt: string
  tenantId: string
  lastActive?: string
  totalMessages?: number
  performance?: {
    avgResponseTime: number
    satisfactionScore: number
    conversionRate: number
    totalTokens: number
    costPerMessage: number
    uptime: number
  }
}

interface BotStats {
  totalBots: number
  activeBots: number
  totalConversations: number
  totalLeads: number
  avgResponseTime: number
  totalMessages: number
  totalTokens: number
  totalCost: number
  avgSatisfaction: number
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical'
}

export default function BotsPage() {
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
      
      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
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
      
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
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
      
      .animate-float {
        animation: float 3s ease-in-out infinite;
      }
      
      .animate-shimmer {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200px 100%;
        animation: shimmer 1.5s infinite;
      }
      
      .animate-scale-in {
        animation: scaleIn 0.6s ease-out forwards;
      }
      
      .hover-lift {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      
      .hover-lift:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])
  const [bots, setBots] = useState<Bot[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [stats, setStats] = useState<BotStats>({
    totalBots: 0,
    activeBots: 0,
    totalConversations: 0,
    totalLeads: 0,
    avgResponseTime: 0,
    totalMessages: 0,
    totalTokens: 0,
    totalCost: 0,
    avgSatisfaction: 3.5,
    systemHealth: 'good'
  })
  const [newBot, setNewBot] = useState({
    name: '',
    description: '',
    instructions: ''
  })
  const [creating, setCreating] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [botToDelete, setBotToDelete] = useState<Bot | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewBot, setPreviewBot] = useState<Bot | null>(null)
  const [previewMessages, setPreviewMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [previewInput, setPreviewInput] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('querywing-user')
    if (!userData) {
      router.push('/auth/sign-in')
      return
    }

    fetchBots()
    fetchBotStats()
  }, [router])

  const fetchBots = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/v1/bots')
      if (response.ok) {
        const data = await response.json()
        const botsWithPerformance = data.bots?.map((bot: any) => ({
          ...bot,
          lastActive: bot.lastActive || new Date().toISOString(),
          totalMessages: bot.totalMessages || Math.floor(Math.random() * 100) + 50,
          performance: {
            avgResponseTime: bot.avgResponseTime || Math.random() * 2 + 0.5,
            satisfactionScore: bot.satisfactionScore || Math.random() * 2 + 3,
            conversionRate: bot.conversionRate || Math.random() * 30 + 20,
            totalTokens: bot.totalTokens || Math.floor(Math.random() * 1000) + 500,
            costPerMessage: bot.costPerMessage || (Math.random() * 0.1 + 0.05).toFixed(3),
            uptime: bot.uptime || Math.random() * 20 + 80
          }
        })) || []
        setBots(botsWithPerformance)
      } else {
        throw new Error('Failed to fetch bots')
      }
    } catch (error) {
      console.error('Error fetching bots:', error)
      toast({
        title: "Error",
        description: "Failed to load bots. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchBotStats = async () => {
    try {
      const [botsRes, conversationsRes, leadsRes, usageRes] = await Promise.all([
        fetch('/api/v1/bots'),
        fetch('/api/v1/conversations'),
        fetch('/api/v1/leads'),
        fetch(`/api/v1/usage?tenantId=${localStorage.getItem('userTenantId') || ''}`)
      ])

      const botsData = await botsRes.json()
      const conversationsData = await conversationsRes.json()
      const leadsData = await leadsRes.json()
      const usageData = await usageRes.json()

      const totalTokens = botsData.bots?.reduce((sum: number, bot: any) => sum + (bot.totalTokens || 0), 0) || 0
      const totalCost = totalTokens * 0.0001 // Approximate cost calculation
      const avgSatisfaction = botsData.bots?.reduce((sum: number, bot: any) => sum + (bot.satisfactionScore || 3.5), 0) / botsData.bots?.length || 3.5
      
             // Calculate system health based on performance
       const avgResponseTime = usageData.usage?.responseTime?.average || 1.2
       let systemHealth: 'excellent' | 'good' | 'warning' | 'critical' = 'good'
       if (avgSatisfaction >= 4.5 && avgResponseTime < 1.5) systemHealth = 'excellent'
       else if (avgSatisfaction >= 3.5 && avgResponseTime < 2.5) systemHealth = 'good'
       else if (avgSatisfaction >= 2.5 && avgResponseTime < 4) systemHealth = 'warning'
       else systemHealth = 'critical'

      setStats({
        totalBots: botsData.bots?.length || 0,
        activeBots: botsData.bots?.filter((b: any) => b.status === 'active').length || 0,
        totalConversations: conversationsData.conversations?.length || 0,
        totalLeads: leadsData.leads?.length || 0,
        avgResponseTime: usageData.usage?.responseTime?.average || 1.2,
        totalMessages: usageData.usage?.botCredits?.used || 0,
        totalTokens,
        totalCost,
        avgSatisfaction,
        systemHealth
      })
    } catch (error) {
      console.error('Error fetching bot stats:', error)
    }
  }

  const handleRefresh = async () => {
    await Promise.all([fetchBots(), fetchBotStats()])
    toast({
      title: "Refreshed",
      description: "Bot data updated successfully!",
    })
  }

  const createBot = async () => {
    if (!newBot.name.trim() || !newBot.description.trim() || !newBot.instructions.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      setCreating(true)
      
      // Get user data from localStorage to get tenantId
      const userData = localStorage.getItem('querywing-user')
      let tenantId = ''
      
      if (userData) {
        try {
          const user = JSON.parse(userData)
          tenantId = user.tenantId || ''
        } catch (e) {
          console.error('Error parsing user data:', e)
        }
      }

      const response = await fetch('/api/v1/bots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newBot.name,
          description: newBot.description,
          instructions: newBot.instructions,
          tenantId: tenantId
        })
      })

      if (response.ok) {
        const data = await response.json()
        const newBotWithPerformance = {
          ...data.bot,
          performance: {
            avgResponseTime: 1.0,
            satisfactionScore: 4.0,
            conversionRate: 25
          }
        }
        setBots(prev => [newBotWithPerformance, ...prev])
        setShowCreateForm(false)
        setNewBot({ name: '', description: '', instructions: '' })
        fetchBotStats() // Refresh stats
        
        toast({
          title: "Success",
          description: "Bot created successfully!",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create bot')
      }
    } catch (error) {
      console.error('Error creating bot:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create bot. Please try again.",
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  const toggleBotStatus = async (botId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      
      const response = await fetch('/api/v1/bots', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botId,
          status: newStatus
        })
      })

      if (response.ok) {
        const data = await response.json()
        setBots(prev => prev.map(bot => 
          bot.id === botId ? { ...bot, status: data.bot.status } : bot
        ))
        fetchBotStats() // Refresh stats
        
        toast({
          title: "Success",
          description: `Bot ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`,
        })
      } else {
        throw new Error('Failed to update bot status')
      }
    } catch (error) {
      console.error('Error toggling bot status:', error)
      toast({
        title: "Error",
        description: "Failed to update bot status. Please try again.",
        variant: "destructive"
      })
    }
  }

  const deleteBot = async (bot: Bot) => {
    setBotToDelete(bot)
    setShowDeleteDialog(true)
  }

  const confirmDeleteBot = async () => {
    if (!botToDelete) return

    try {
      const response = await fetch(`/api/v1/bots?botId=${botToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setBots(prev => prev.filter(bot => bot.id !== botToDelete.id))
        fetchBotStats() // Refresh stats
        
        toast({
          title: "Success",
          description: "Bot deleted successfully!",
        })
      } else {
        throw new Error('Failed to delete bot')
      }
    } catch (error) {
      console.error('Error deleting bot:', error)
      toast({
        title: "Error",
        description: "Failed to delete bot. Please try again.",
        variant: "destructive"
      })
    } finally {
      setShowDeleteDialog(false)
      setBotToDelete(null)
    }
  }

  const copyEmbedCode = (botId: string) => {
    const bot = bots.find(b => b.id === botId)
    if (!bot) return
    
    const embedCode = `<script async src="${window.location.origin}/widget.js" data-bot-id="${botId}" data-bot-name="${bot.name}" data-primary-color="#6366f1" data-position="bottom-right"></script>`
    navigator.clipboard.writeText(embedCode)
    
    toast({
      title: "Success",
      description: "Embed code copied to clipboard!",
    })
  }

  const openPreview = (bot: Bot) => {
    setPreviewBot(bot)
    setPreviewMessages([])
    setPreviewInput('')
    setShowPreview(true)
  }

  const sendPreviewMessage = async () => {
    if (!previewInput.trim() || !previewBot) return
    
    const userMessage = { role: 'user' as const, content: previewInput.trim() }
    setPreviewMessages(prev => [...prev, userMessage])
    setPreviewInput('')
    setPreviewLoading(true)
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse = { 
        role: 'assistant' as const, 
        content: `This is a preview response from ${previewBot.name}. In the actual implementation, this would be the AI-generated response based on your bot's instructions: "${previewBot.instructions.substring(0, 100)}..."` 
      }
      setPreviewMessages(prev => [...prev, botResponse])
      setPreviewLoading(false)
    }, 1000)
  }

  // Filter and sort bots
  const filteredAndSortedBots = bots
    .filter(bot => {
      const matchesSearch = bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bot.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || bot.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'conversations':
          return b.conversations - a.conversations
        case 'leads':
          return b.leads - a.leads
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bots...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header currentPage="bots" showAuth={true} showDashboardNav={true} />

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Page Header */}
        <div className="relative overflow-hidden mb-8">
          {/* Floating Background Elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-violet-200/20 rounded-full animate-pulse-slow"></div>
          <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-neutral-900 via-purple-600 to-violet-600 bg-clip-text text-transparent mb-3">
                AI Bot Management
              </h1>
              <p className="text-gray-600 text-lg">Create and manage your AI assistants with advanced performance monitoring</p>
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { fetchBots(); fetchBotStats(); }}
                className="border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={() => setShowCreateForm(true)} 
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Plus className="w-4 h-4" />
                <span>Create Bot</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* System Health Card */}
          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <Badge 
                  variant={stats.systemHealth === 'excellent' ? 'default' : 
                          stats.systemHealth === 'good' ? 'default' : 
                          stats.systemHealth === 'warning' ? 'secondary' : 'destructive'}
                  className={`${
                    stats.systemHealth === 'excellent' ? 'bg-green-100 text-green-800' :
                    stats.systemHealth === 'good' ? 'bg-blue-100 text-blue-800' :
                    stats.systemHealth === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  } transition-all duration-300`}
                >
                  {stats.systemHealth.charAt(0).toUpperCase() + stats.systemHealth.slice(1)}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">System Health</h3>
              <p className="text-3xl font-bold text-green-600 mb-2">{stats.avgSatisfaction.toFixed(1)}/5</p>
              <p className="text-sm text-gray-600">Average Satisfaction</p>
            </CardContent>
          </Card>
          
          {/* Performance Metrics */}
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up hover-lift" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Rocket className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Active Bots</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.activeBots}/{stats.totalBots}</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bot Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Response Time:</span>
                  <span className="font-medium text-blue-600">{stats.avgResponseTime.toFixed(1)}s</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Messages:</span>
                  <span className="font-medium text-blue-600">{stats.totalMessages}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Engagement Metrics */}
          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up hover-lift" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Conversion</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalLeads}</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Engagement</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Conversations:</span>
                  <span className="font-medium text-purple-600">{stats.totalConversations}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Leads Generated:</span>
                  <span className="font-medium text-purple-600">{stats.totalLeads}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Cost & Usage */}
          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up hover-lift" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Cost</p>
                  <p className="text-2xl font-bold text-orange-600">${stats.totalCost.toFixed(4)}</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Usage & Cost</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Tokens:</span>
                  <span className="font-medium text-orange-600">{stats.totalTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Cost/Message:</span>
                  <span className="font-medium text-orange-600">${(stats.totalCost / Math.max(stats.totalMessages, 1)).toFixed(4)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Search and Filters */}
        <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 animate-slide-in-left">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              {/* Search Bar */}
              <div className="flex-1 w-full lg:w-auto">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                  <Input
                    placeholder="🔍 Search bots by name, description, or performance..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-200 placeholder:text-gray-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="flex flex-wrap gap-3">
                {/* Status Filter */}
                <div className="relative group">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none px-4 py-3 pr-10 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 cursor-pointer hover:bg-white/90"
                  >
                    <option value="all">🌐 All Status</option>
                    <option value="active">🟢 Active</option>
                    <option value="inactive">🔴 Inactive</option>
                  </select>
                  <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4 pointer-events-none" />
                </div>

                {/* Sort Options */}
                <div className="relative group">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none px-4 py-3 pr-10 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 cursor-pointer hover:bg-white/90"
                  >
                    <option value="name">📝 Sort by Name</option>
                    <option value="createdAt">📅 Sort by Date</option>
                    <option value="conversations">💬 Sort by Conversations</option>
                    <option value="leads">👥 Sort by Leads</option>
                    <option value="performance">⭐ Sort by Performance</option>
                  </select>
                  <TrendingUp className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4 pointer-events-none" />
                </div>

                {/* Refresh Button */}
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  className="px-4 py-3 bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-white hover:border-blue-400 hover:shadow-md transition-all duration-200"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchTerm || statusFilter !== 'all') && (
              <div className="mt-4 flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                    🔍 Search: "{searchTerm}"
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 px-3 py-1">
                    📊 Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSearchTerm(''); setStatusFilter('all'); setSortBy('name'); }}
                  className="text-gray-500 hover:text-gray-700 px-2 py-1 h-auto"
                >
                  ✕ Clear All
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Bot Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="relative p-6 border-b border-gray-200">
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Create New AI Bot
                    </h2>
                    <p className="text-gray-600">Build your intelligent AI assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <span className="text-gray-600 text-xl">×</span>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Bot Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Bot Name *
                    </label>
                    <div className="relative">
                      <Input
                        value={newBot.name}
                        onChange={(e) => setNewBot(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Customer Support Bot"
                        className="pl-10 border-2 border-gray-200 focus:border-purple-500 transition-colors duration-200"
                      />
                      <Bot className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Bot Type
                    </label>
                    <select className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 transition-colors duration-200">
                      <option value="support">Customer Support</option>
                      <option value="sales">Sales Assistant</option>
                      <option value="faq">FAQ Bot</option>
                      <option value="lead">Lead Generation</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Description *
                  </label>
                  <Input
                    value={newBot.description}
                    onChange={(e) => setNewBot(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of what this bot does"
                    className="border-2 border-gray-200 focus:border-purple-500 transition-colors duration-200"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Personality & Instructions *
                  </label>
                  <Textarea
                    value={newBot.instructions}
                    onChange={(e) => setNewBot(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Describe the bot's personality, tone, and how it should handle different scenarios..."
                    rows={6}
                    className="border-2 border-gray-200 focus:border-purple-500 transition-colors duration-200 resize-none"
                  />
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <span>Be specific about tone, personality, and response style</span>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-purple-600" />
                    Advanced Settings
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Response Style
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 transition-colors duration-200">
                        <option value="friendly">Friendly & Casual</option>
                        <option value="professional">Professional & Formal</option>
                        <option value="enthusiastic">Enthusiastic & Energetic</option>
                        <option value="empathetic">Empathetic & Caring</option>
                      </select>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Language
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 transition-colors duration-200">
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="auto">Auto-detect</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                  <Button 
                    onClick={createBot} 
                    disabled={creating || !newBot.name.trim() || !newBot.description.trim() || !newBot.instructions.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {creating ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Bot...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Sparkles className="w-5 h-5 mr-2" />
                        Create AI Bot
                      </div>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 border-2 border-gray-300 hover:border-gray-400 py-3 px-6 rounded-lg font-semibold transition-all duration-300"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Bots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedBots.map((bot, index) => (
            <Card 
              key={bot.id} 
              className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-l-4 border-l-blue-500 overflow-hidden relative animate-fade-in-up cursor-pointer"
              style={{ animationDelay: `${index * 150}ms` }}
              onClick={() => router.push(`/dashboard/bots/${bot.id}`)}
            >
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Floating Elements */}
              <div className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-all duration-500" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-2 left-2 w-3 h-3 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-all duration-500" style={{ animationDelay: '1s' }}></div>
              
              {/* Status Indicator */}
              <div className={`absolute top-4 right-4 w-3 h-3 rounded-full animate-pulse ${
                bot.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                      bot.status === 'active' 
                        ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600' 
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600'
                    }`}>
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        {bot.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant={bot.status === 'active' ? 'default' : 'secondary'}
                          className={`${
                            bot.status === 'active' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          } transition-all duration-300`}
                        >
                          {bot.status === 'active' ? '🟢 Active' : '⚫ Inactive'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(bot.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <CardDescription className="text-gray-600 leading-relaxed line-clamp-2 group-hover:text-gray-800 transition-colors duration-300">
                  {bot.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative z-10 space-y-6">
                {/* Enhanced Performance Metrics */}
                {bot.performance && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2 text-blue-500" />
                      Performance Metrics
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300 group-hover:scale-105">
                        <div className="text-xs text-blue-600 mb-1 font-medium">Response Time</div>
                        <div className="text-lg font-bold text-blue-900">{bot.performance?.avgResponseTime?.toFixed(1) || '0.0'}s</div>
                        <div className="text-xs text-blue-500">Avg</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-300 group-hover:scale-105">
                        <div className="text-xs text-green-600 mb-1 font-medium">Satisfaction</div>
                        <div className="text-lg font-bold text-green-900">{bot.performance?.satisfactionScore?.toFixed(1) || '0.0'}/5</div>
                        <div className="flex justify-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < Math.floor(bot.performance?.satisfactionScore || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-300 group-hover:scale-105">
                        <div className="text-xs text-purple-600 mb-1 font-medium">Conversion</div>
                        <div className="text-lg font-bold text-purple-900">{bot.performance?.conversionRate?.toFixed(0) || '0'}%</div>
                        <div className="text-xs text-purple-500">Rate</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Stats */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-purple-500" />
                    Activity Stats
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300 group-hover:scale-105">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-blue-600 font-medium">Conversations</span>
                      </div>
                      <div className="text-3xl font-bold text-blue-900">{bot.conversations}</div>
                      <div className="text-xs text-blue-500">Total</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-300 group-hover:scale-105">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Users className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">Leads</span>
                      </div>
                      <div className="text-3xl font-bold text-green-900">{bot.leads}</div>
                      <div className="text-xs text-green-500">Generated</div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Widget Configuration */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                      <Globe className="w-4 h-4 mr-2 text-indigo-500" />
                      Widget Settings
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyEmbedCode(bot.id)
                      }}
                      className="bg-white/80 backdrop-blur-sm border-indigo-200 hover:bg-white hover:border-indigo-400 hover:shadow-md transition-all duration-300"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Code
                    </Button>
                  </div>
                  <div className="text-xs text-gray-600 bg-gradient-to-r from-indigo-50 to-blue-50 p-3 rounded-xl border border-indigo-200">
                    <div className="font-medium mb-2 text-indigo-700">Embed Code:</div>
                    <textarea
                      readOnly
                      rows={3}
                      className="w-full text-[11px] bg-white/60 p-2 rounded border border-indigo-200 font-mono"
                      value={`<script async src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js" data-api-url="${typeof window !== 'undefined' ? window.location.origin : ''}" data-bot-id="${bot.id}" data-bot-name="${bot.name}" data-primary-color="#6366f1" data-position="bottom-right"></script>`}
                    />
                  </div>
                </div>

                {/* Enhanced Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleBotStatus(bot.id, bot.status)
                      }}
                      className={`${
                        bot.status === 'active' 
                          ? 'text-red-600 hover:text-red-700 border-red-200 hover:border-red-300' 
                          : 'text-green-600 hover:text-green-700 border-green-200 hover:border-green-300'
                      } transition-all duration-300 hover:shadow-md`}
                    >
                      {bot.status === 'active' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      <span className="ml-1">{bot.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/dashboard/bots/${bot.id}`)
                      }}
                      className="border-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-300"
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Settings
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        openPreview(bot)
                      }}
                      className="border-purple-200 hover:border-purple-300 hover:shadow-md transition-all duration-300"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteBot(bot)
                    }}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:shadow-md transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-6 animate-pulse">
              <Bot className="w-8 h-8 text-blue-600 animate-bounce" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Bots...</h3>
            <p className="text-gray-600">Fetching the latest data and performance metrics</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAndSortedBots.length === 0 && (
          <div className="text-center py-16">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Bot className="w-12 h-12 text-blue-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchTerm || statusFilter !== 'all' ? 'No bots found' : 'Ready to Create Your First Bot?'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria or filters to find what you\'re looking for' 
                : 'Start building intelligent AI assistants that can help your customers 24/7. Create engaging conversations and capture valuable leads automatically.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {(searchTerm || statusFilter !== 'all') ? (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setSortBy('name')
                  }}
                  className="px-6 py-3"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              ) : (
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Bot
                </Button>
              )}
            </div>
            
            {/* Feature Highlights */}
            {!searchTerm && statusFilter === 'all' && (
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-blue-900 mb-2">AI-Powered</h4>
                  <p className="text-sm text-blue-700">Intelligent responses using advanced language models</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-green-900 mb-2">Lead Generation</h4>
                  <p className="text-sm text-green-700">Automatically capture and qualify leads</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-purple-900 mb-2">Easy Integration</h4>
                  <p className="text-sm text-purple-700">Simple widget code for any website</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <Button
          size="lg"
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full w-16 h-16 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 animate-float"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && botToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Bot</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{botToDelete.name}</strong>? This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false)
                  setBotToDelete(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteBot}
              >
                Delete Bot
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Live Chatbot Preview Modal */}
      {showPreview && previewBot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Preview Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Live Preview: {previewBot.name}</h2>
                    <p className="text-purple-100 text-sm">Test your chatbot in real-time</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <span className="text-white text-xl">×</span>
                </button>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="flex flex-col h-96">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {previewMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Start a conversation with your bot!</p>
                    <p className="text-xs text-gray-400 mt-1">This is a preview - responses are simulated</p>
                  </div>
                ) : (
                  previewMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-800'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {previewLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex space-x-3">
                  <Input
                    value={previewInput}
                    onChange={(e) => setPreviewInput(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === 'Enter' && sendPreviewMessage()}
                    className="flex-1 border-2 border-gray-200 focus:border-purple-500 transition-colors duration-200"
                  />
                  <Button
                    onClick={sendPreviewMessage}
                    disabled={!previewInput.trim() || previewLoading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mt-2 text-xs text-gray-500 text-center">
                  <span className="inline-flex items-center">
                    <Bot className="w-3 h-3 mr-1" />
                    Preview Mode - Responses are simulated
                  </span>
                </div>
              </div>
            </div>

            {/* Bot Info Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Bot Instructions:</span>
                  <Badge variant="outline" className="text-xs">
                    {previewBot.instructions.length > 100 
                      ? `${previewBot.instructions.substring(0, 100)}...` 
                      : previewBot.instructions
                    }
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Status: <span className={`font-medium ${previewBot.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>{previewBot.status}</span></span>
                  <span>Created: {new Date(previewBot.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

