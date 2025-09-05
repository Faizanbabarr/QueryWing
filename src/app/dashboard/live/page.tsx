"use client"

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import Header from '@/components/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getPlanConfig } from '@/lib/plan-config'
import { 
  MessageCircle, 
  Users, 
  Clock, 
  Activity, 
  Plus, 
  X, 
  Send,
  Phone,
  Mail,
  Building,
  Globe,
  Zap,
  Shield,
  UserCheck,
  UserX,
  CheckCircle,
  AlertCircle,
  Trash2,
  Settings,
  RefreshCw,
  DollarSign
} from 'lucide-react'

interface LiveRequest {
  id: string
  name: string
  email: string | null
  issue: string
  status: 'queued' | 'in_progress' | 'closed'
  createdAt: string
}

interface Message {
  id: string
  role: 'user' | 'agent'
  content: string
  createdAt: string
}

export default function LiveChatPage() {
  const { user, isLoaded } = useAuth()
  // Classic, minimal UI – removed heavy animations and backgrounds

  const [requests, setRequests] = useState<LiveRequest[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [input, setInput] = useState('')
  const pollRef = useRef<any>(null)
  const [activeReq, setActiveReq] = useState<LiveRequest | null>(null)
  const [planUsage, setPlanUsage] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAddAgentModal, setShowAddAgentModal] = useState(false)
  const [newAgentData, setNewAgentData] = useState({
    name: '',
    email: '',
    hourlyRate: 40
  })
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (showAddAgentModal) {
      setNewAgentData({ name: '', email: '', hourlyRate: 40 })
    }
  }, [showAddAgentModal])
  const [liveAgents, setLiveAgents] = useState<any[]>([])
  const [currentAgent, setCurrentAgent] = useState<any>(null)
  const [availability, setAvailability] = useState<'available' | 'busy' | 'offline'>('available')
  const [showRemoveAgentModal, setShowRemoveAgentModal] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal')
  
  useEffect(() => { 
    fetchRequests(); 
    fetchPlanUsage();
    fetchLiveAgents();
    const i=setInterval(fetchRequests,5000); 
    return ()=>clearInterval(i) 
  }, [])
  
  useEffect(() => {
    if (!activeId) { setActiveReq(null); return }
    const r = requests.find(r=>r.id===activeId) || null
    setActiveReq(r)
    fetchMessages()
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(fetchMessages, 3000)
    return () => pollRef.current && clearInterval(pollRef.current)
  }, [activeId, requests])

  const fetchPlanUsage = async () => {
    try {
      // Get tenant ID from user context or localStorage
      const userTenantId = localStorage.getItem('userTenantId') || ''
      const res = await fetch(`/api/v1/usage?tenantId=${userTenantId}`)
      if (res.ok) {
        const data = await res.json()
        setPlanUsage(data)
      } else {
        console.error('Failed to fetch plan usage:', res.status, res.statusText)
      }
    } catch (error) {
      console.error('Error fetching plan usage:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLiveAgents = async () => {
    try {
      // Get tenant ID from user context or localStorage
      const userTenantId = localStorage.getItem('userTenantId') || ''
      const res = await fetch(`/api/v1/live-agents?tenantId=${userTenantId}`)
      if (res.ok) {
        const data = await res.json()
        setLiveAgents(data.liveAgents || [])
        const me = (data.liveAgents || []).find((a: any) => a.user?.id === user?.id)
        if (me) {
          setCurrentAgent(me)
          if (me.status) setAvailability(me.status)
        }
      } else {
        console.error('Failed to fetch live agents:', res.status, res.statusText)
      }
    } catch (error) {
      console.error('Error fetching live agents:', error)
    }
  }

  const fetchRequests = async () => {
    try {
      const tenantId = localStorage.getItem('userTenantId') || ''
      const res = await fetch(`/api/v1/live-agent-requests?tenantId=${tenantId}`)
      if (!res.ok) return
      const data = await res.json()
      const mapped = (data.requests || []).map((r: any) => ({
        id: r.id,
        name: r.conversation?.visitorId || 'Visitor',
        email: null,
        issue: r.issue || r.requestType || 'Live chat',
        status: (r.status === 'assigned' ? 'in_progress' : (r.status || 'queued')) as 'queued' | 'in_progress' | 'closed',
        createdAt: r.createdAt || new Date().toISOString(),
      }))
      setRequests(mapped)
    } catch {}
  }

  const fetchMessages = async () => {
    if (!activeId) return
    try {
      const res = await fetch(`/api/v1/live/messages?requestId=${activeId}`)
      if (!res.ok) return
      const data = await res.json()
      setMessages(data.messages || [])
    } catch {}
  }

  const send = async () => {
    const content = input.trim()
    if (!content || !activeId) return
    setInput('')
    setIsTyping(true)
    // Quick beep
    try { const ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); const o = ctx.createOscillator(); const g = ctx.createGain(); o.type = 'sine'; o.frequency.value = 660; o.connect(g); g.connect(ctx.destination); g.gain.setValueAtTime(0.05, ctx.currentTime); o.start(); o.stop(ctx.currentTime + 0.07) } catch {}
    try {
      await fetch('/api/v1/live/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: activeId, role: 'agent', content })
      })
      fetchMessages()
    } catch {}
    finally { setIsTyping(false) }
  }

  const updateAvailability = async (newStatus: 'available'|'busy'|'offline') => {
    if (!currentAgent) return
    try {
      await fetch('/api/v1/live-agents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: currentAgent.id, status: newStatus })
      })
      setAvailability(newStatus)
      fetchLiveAgents()
    } catch (e) {
      console.error('Failed to update availability', e)
    }
  }

  const updatePriority = async (newPriority: 'low'|'normal'|'high'|'urgent') => {
    if (!activeId) return
    try {
      await fetch('/api/v1/live-agent-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: activeId, status: activeReq?.status === 'in_progress' ? 'assigned' : 'pending', priority: newPriority })
      })
      setPriority(newPriority)
      fetchRequests()
    } catch (e) {
      console.error('Failed to update priority', e)
    }
  }

  const saveNotes = async () => {
    if (!activeId) return
    try {
      await fetch('/api/v1/live-agent-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: activeId, notes })
      })
    } catch (e) {
      console.error('Failed to save notes', e)
    }
  }

  const endChat = async () => {
    if (!activeId && !activeReq) return
    try {
      await fetch('/api/v1/live-agent-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: activeId, status: 'completed' })
      })
      fetchRequests()
    } catch {}
  }

  const claimRequest = async (requestId: string) => {
    try {
      await fetch('/api/v1/live-agent-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status: 'assigned', assignedAgentId: currentAgent?.id })
      })
      setActiveId(requestId)
      fetchRequests()
    } catch {}
  }

    const handleAddAgent = async () => {
    try {
      console.log('Starting to add agent with data:', newAgentData)
      
      // Validate form data
      if (!newAgentData.name || !newAgentData.name.trim()) {
        alert('Please enter a valid agent name')
        return
      }
      
      if (!newAgentData.email || !newAgentData.email.trim()) {
        alert('Please enter a valid email address')
        return
      }
      
      if (newAgentData.hourlyRate <= 0) {
        alert('Please enter a valid hourly rate')
        return
      }
      
      // Check if we can add more agents based on plan
      if (planUsage && planUsage.current.liveAgents >= planUsage.limits.maxLiveAgents) {
        alert(`You've reached the maximum number of live agents (${planUsage.limits.maxLiveAgents}) for your ${planUsage.plan} plan. Please upgrade to add more agents.`)
        return
      }

      // Get tenant ID from user context or localStorage
      const userTenantId = localStorage.getItem('userTenantId') || ''
      console.log('Using tenant ID:', userTenantId)
      
      const requestBody = {
        tenantId: userTenantId,
        name: newAgentData.name,
        email: newAgentData.email,
        hourlyRate: newAgentData.hourlyRate
      }
      
      console.log('Sending request with body:', requestBody)
      
      const res = await fetch('/api/v1/live-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      console.log('Response status:', res.status)
      console.log('Response ok:', res.ok)
      
      if (res.ok) {
        const result = await res.json()
        console.log('Success response:', result)
        
        setShowAddAgentModal(false)
        setNewAgentData({ name: '', email: '', hourlyRate: 40 })
        fetchPlanUsage() // Refresh usage data
        fetchLiveAgents() // Refresh live agents list
        
        // Show success message
        alert(`Successfully added live agent: ${newAgentData.name}`)
      } else {
        const errorData = await res.json()
        console.error('API Error:', errorData)
        alert(`Failed to add agent: ${errorData.error || 'Unknown error occurred'}`)
      }
    } catch (error) {
      console.error('Network/Other Error:', error)
      alert('Network error occurred while adding agent. Please try again.')
    }
  }

  const handleRemoveAgent = async (agentId: string) => {
    try {
      const res = await fetch(`/api/v1/live-agents?agentId=${agentId}`, {
        method: 'DELETE'
      })
      
             if (res.ok) {
         const result = await res.json()
         setShowRemoveAgentModal(null)
         fetchPlanUsage() // Refresh usage data
         fetchLiveAgents() // Refresh live agents list
         
         // Show success message
         alert('Live agent removed successfully')
       } else {
         const errorData = await res.json()
         console.error('API Error:', errorData)
         alert(`Failed to remove agent: ${errorData.error || 'Unknown error occurred'}`)
       }
     } catch (error) {
       console.error('Network/Other Error:', error)
       alert('Network error occurred while removing agent. Please try again.')
     }
  }

  const handleRefresh = () => {
    fetchRequests()
    fetchPlanUsage()
    fetchLiveAgents()
    // Sound on new queued requests
    try {
      const queuedCount = requests.filter(r => r.status === 'queued').length
      if (queuedCount > 0) {
        const audio = new Audio('/notification.mp3')
        audio.volume = 0.15
        audio.play().catch(()=>{})
      }
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="live" showAuth={true} showDashboardNav={true} />
      
      {/* Enhanced Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="relative overflow-hidden mb-8">
          {/* Floating Background Elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full animate-pulse-slow"></div>
          <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-br from-purple-200/20 to-violet-200/20 rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-neutral-900 via-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                Live Chat Management
              </h1>
              <p className="text-gray-600 text-lg">Manage live conversations and agent handoffs in real-time</p>
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="border-green-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button 
                size="sm" 
                onClick={() => setShowAddAgentModal(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Agent
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Plan Usage Overview */}
        {planUsage && (
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-800">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                Live Agent Usage
                <Badge variant="outline" className="border-green-200 text-green-700">
                  {planUsage.plan}
                </Badge>
              </CardTitle>
              <CardDescription className="text-green-600">
                Monitor your live agent capacity and usage
              </CardDescription>
              {planUsage.current.liveAgents < planUsage.limits.maxLiveAgents && (
                <Button
                  onClick={() => setShowAddAgentModal(true)}
                  size="sm"
                  className="mt-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Live Agent
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Live Agents Usage */}
                <div className="p-4 bg-white rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-green-700 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Live Agents
                    </span>
                    <span className="text-sm text-gray-600">
                      {planUsage.current.liveAgents} / {planUsage.limits.maxLiveAgents === -1 ? '∞' : planUsage.limits.maxLiveAgents}
                    </span>
                  </div>
                  <Progress 
                    value={planUsage.usage.liveAgents.percentage} 
                    className="h-3 bg-green-100"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {planUsage.limits.maxLiveAgents === -1 ? 'Unlimited agents' : `${planUsage.limits.maxLiveAgents} agents included`}
                  </p>
                </div>

                {/* Bot Credits */}
                <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-blue-700 flex items-center">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Bot Credits
                    </span>
                    <span className="text-sm text-gray-600">
                      {planUsage.usage.botCredits.used} / {planUsage.usage.botCredits.total === -1 ? '∞' : planUsage.usage.botCredits.total}
                    </span>
                  </div>
                  <Progress 
                    value={planUsage.usage.botCredits.percentage} 
                    className="h-3 bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {planUsage.usage.botCredits.total === -1 ? 'Unlimited credits' : `${planUsage.usage.botCredits.total} credits included`}
                  </p>
                </div>

                {/* Active Requests */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Active Requests
                    </span>
                    <span className="text-sm text-gray-600">
                      {requests.filter(r => r.status !== 'closed').length}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 rounded" />
                  <p className="text-xs text-gray-500 mt-2">
                    {requests.filter(r => r.status !== 'closed').length} requests in queue
                  </p>
                </div>
              </div>

              {/* Current Live Agents */}
              <div className="mt-8 pt-6 border-t border-green-200">
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Current Live Agents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {liveAgents.map((agent, index) => (
                    <Card 
                      key={agent.id} 
                      className=""
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                              <UserCheck className="w-5 h-5 text-neutral-600" />
                            </div>
                            <div>
                              <div className="font-medium text-sm text-gray-900">{agent.name}</div>
                              <div className="text-xs text-gray-600 flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {agent.email}
                              </div>
                            </div>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className="text-xs"
                          >
                            {agent.status === 'available' ? 'Available' : 'Busy'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">${agent.hourlyRate}/hr</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowRemoveAgentModal(agent.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {liveAgents.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <Users className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-500">No live agents configured yet</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Live Chat Interface */}
        <div className="grid grid-cols-12 gap-6">
          {/* Live Requests Sidebar */}
          <aside className="col-span-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Live Requests
                  <Badge variant="secondary" className="ml-2">
                    {requests.filter(r => r.status !== 'closed').length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[70vh] overflow-y-auto">
                  {requests.map((r, index) => (
                    <button 
                      key={r.id} 
                      onClick={() => setActiveId(r.id)} 
                      className={`w-full text-left p-4 border-b hover:bg-neutral-50 ${
                        activeId === r.id ? 'bg-neutral-50 border-l-4 border-l-neutral-400' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-gray-900">{r.name}</div>
                        <Badge 
                          variant="secondary" 
                          className="text-xs"
                        >
                          {r.status === 'queued' && '⏳ Queued'}
                          {r.status === 'in_progress' && '🔄 In Progress'}
                          {r.status === 'closed' && '✅ Closed'}
                        </Badge>
                      </div>
                      {r.email && (
                        <div className="text-sm text-gray-600 mb-2 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {r.email}
                        </div>
                      )}
                      <div className="text-sm text-gray-600 truncate mb-2">{r.issue || 'No subject'}</div>
                      <div className="text-xs text-gray-400 flex items-center justify-between">
                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{new Date(r.createdAt).toLocaleString()}</span>
                        {r.status === 'queued' && (
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); claimRequest(r.id) }}>
                            Claim
                          </Button>
                        )}
                      </div>
                    </button>
                  ))}
                  {!requests.length && (
                    <div className="p-8 text-center">
                      <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-500">No live requests yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Chat Main Area */}
          <main className="col-span-8">
            <Card className="h-[70vh] flex flex-col">
              <CardHeader className="pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    <div>
                      <CardTitle className="text-lg">Conversation</CardTitle>
                      {activeReq && activeReq.status === 'in_progress' && (
                        <div className="flex items-center text-xs text-neutral-600 mt-1">
                          <UserCheck className="w-3 h-3 mr-1" />
                          Active Agent: {liveAgents.find(agent => agent.status === 'available')?.name || 'Live Agent'}
                        </div>
                      )}
                      {activeReq && (
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-600">{activeReq.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {activeReq.status === 'queued' && '⏳ Queued'}
                            {activeReq.status === 'in_progress' && '🔄 In Progress'}
                            {activeReq.status === 'closed' && '✅ Closed'}
                          </Badge>
                          {activeReq.status === 'in_progress' && (
                            <div className="flex items-center text-xs text-neutral-600">
                              <UserCheck className="w-3 h-3 mr-1" />
                              Handled by: {liveAgents.find(agent => agent.status === 'available')?.name || 'Live Agent'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeReq && (
                      <select
                        value={priority}
                        onChange={(e) => updatePriority(e.target.value as any)}
                        className="text-xs border rounded px-2 py-1"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    )}
                    {activeReq && activeReq.status !== 'closed' && (
                      <Button 
                        onClick={endChat} 
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                      >
                        <X className="w-4 h-4 mr-2" />
                        End Chat
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {messages.map((m) => (
                  <div 
                    key={m.id} 
                    className={`flex ${m.role === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] px-4 py-3 rounded-2xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
                      m.role === 'agent' 
                        ? 'bg-blue-600 text-white rounded-br-md' 
                        : 'bg-white text-gray-900 rounded-bl-md border'
                    }`}>
                      {m.role === 'agent' && (
                        <div className="text-xs opacity-80 mb-1 flex items-center">
                          <UserCheck className="w-3 h-3 mr-1" />
                          {liveAgents.find(agent => agent.status === 'available')?.name || 'Live Agent'}
                        </div>
                      )}
                      {m.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-end">
                    <div className="max-w-[70%] px-4 py-3 rounded-2xl bg-blue-600 text-white rounded-br-md opacity-80">
                      <span className="inline-flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '120ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '240ms' }} />
                      </span>
                    </div>
                  </div>
                )}
                {!activeId && (
                  <div className="text-center py-16">
                    <MessageCircle className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">Select a live request from the left to begin.</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-3">
                  <Input 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    onKeyDown={e => {if(e.key === 'Enter') send()}} 
                    placeholder="Type a reply..." 
                    className="flex-1"
                  />
                  <Button 
                    onClick={send} 
                    disabled={!activeId || !input.trim()}
                    size="sm"
                    className=""
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
                {/* Quick replies */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {['On it!','Could you share more details?','I\'ve just assigned this to an agent.','Thanks for waiting!'].map((q)=> (
                    <Button key={q} size="sm" variant="outline" onClick={()=>{ setInput(q) }}>
                      {q}
                    </Button>
                  ))}
                </div>
                {activeReq && (
                  <div className="mt-4">
                    <label className="text-xs text-neutral-600">Agent Notes</label>
                    <textarea
                      className="w-full mt-1 rounded border p-2 text-sm"
                      rows={3}
                      value={notes}
                      onChange={(e)=>setNotes(e.target.value)}
                      onBlur={saveNotes}
                      placeholder="Add internal notes about this request..."
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-neutral-600">My availability:</span>
                      <select value={availability} onChange={(e)=>updateAvailability(e.target.value as any)} className="text-xs border rounded px-2 py-1">
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </main>
        </div>
      </div>

      {/* Enhanced Add Agent Modal */}
      {showAddAgentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-96 max-w-md shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add New Live Agent</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddAgentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserCheck className="w-4 h-4 inline mr-2" />
                  Name
                </label>
                <Input
                  type="text"
                  value={newAgentData.name}
                  onChange={(e) => setNewAgentData({...newAgentData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="Agent name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <Input
                  type="email"
                  value={newAgentData.email}
                  onChange={(e) => setNewAgentData({...newAgentData, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="agent@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Hourly Rate ($)
                </label>
                <Input
                  type="number"
                  value={newAgentData.hourlyRate}
                  onChange={(e) => setNewAgentData({...newAgentData, hourlyRate: parseFloat(e.target.value) || 0})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="40"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <Button
                variant="outline"
                onClick={() => setShowAddAgentModal(false)}
                className="flex-1 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </Button>
                             <Button
                 onClick={handleAddAgent}
                 disabled={!newAgentData.name?.trim() || !newAgentData.email?.trim()}
                 className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
               >
                 <Plus className="w-4 h-4 mr-2" />
                 Add Agent
               </Button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Remove Agent Confirmation Modal */}
      {showRemoveAgentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-96 max-w-md shadow-2xl animate-fade-in-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Remove Live Agent</h3>
              <p className="text-gray-600">
                Are you sure you want to remove this live agent? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowRemoveAgentModal(null)}
                className="flex-1 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleRemoveAgent(showRemoveAgentModal)}
                variant="destructive"
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Agent
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


