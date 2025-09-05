"use client"
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  Building,
  Star,
  Eye,
  Edit,
  Trash2,
  Plus,
  MoreHorizontal
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Modal } from '@/components/ui/modal'
import { Dialog } from '@/components/ui/dialog'
import { LeadForm } from '@/components/LeadForm'
import { LeadDetailView } from '@/components/LeadDetailView'
import { useToast } from '@/hooks/use-toast'

interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  score: number
  capturedAt: string
  lastContacted?: string
  notes?: string
  tags: string[]
  conversationId?: string
  botId?: string
}

export default function LeadsPage() {
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

  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [currentLead, setCurrentLead] = useState<Lead | null>(null)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null)
  const [editingScoreValue, setEditingScoreValue] = useState<number>(0)
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all')
  const [scoreRangeFilter, setScoreRangeFilter] = useState<string>('all')
  const [hasCompanyFilter, setHasCompanyFilter] = useState<string>('all')
  const [message, setMessage] = useState('')
  const [showLeadInsights, setShowLeadInsights] = useState(false)
  const [leadAnalytics, setLeadAnalytics] = useState<{
    conversionRate: number
    avgScore: number
    topSources: Array<{ source: string; count: number }>
    scoreDistribution: Array<{ range: string; count: number }>
    monthlyTrend: Array<{ month: string; count: number }>
  }>({
    conversionRate: 0,
    avgScore: 0,
    topSources: [],
    scoreDistribution: [],
    monthlyTrend: []
  })
  
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchLeads()
    // Removed automatic updates - only fetch when needed
  }, [])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/v1/leads')
      if (response.ok) {
        const data = await response.json()
        const transformedLeads = data.leads.map((lead: any) => ({
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          source: lead.bot?.name || lead.source || 'Unknown Bot',
          status: lead.status,
          score: lead.score || Math.floor(Math.random() * 30) + 70,
          capturedAt: new Date(lead.capturedAt).toLocaleDateString(),
          lastContacted: lead.lastContacted ? new Date(lead.lastContacted).toLocaleDateString() : undefined,
          notes: lead.notes,
          tags: lead.tags || [],
          conversationId: lead.conversationId,
          botId: lead.botId
        }))
        setLeads(transformedLeads)
        // Removed auto-update notification
      } else {
        throw new Error('Failed to fetch leads')
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
      toast({
        title: "Error",
        description: "Failed to load leads. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter
    
    // Advanced filters
    const matchesDateRange = dateRangeFilter === 'all' || (() => {
      const capturedDate = new Date(lead.capturedAt)
      const now = new Date()
      switch (dateRangeFilter) {
        case '7days':
          return (now.getTime() - capturedDate.getTime()) <= 7 * 24 * 60 * 60 * 1000
        case '30days':
          return (now.getTime() - capturedDate.getTime()) <= 30 * 24 * 60 * 60 * 1000
        case '90days':
          return (now.getTime() - capturedDate.getTime()) <= 90 * 24 * 60 * 60 * 1000
        default:
          return true
      }
    })()
    
    const matchesScoreRange = scoreRangeFilter === 'all' || (() => {
      switch (scoreRangeFilter) {
        case '70-80':
          return lead.score >= 70 && lead.score <= 80
        case '80-90':
          return lead.score >= 80 && lead.score <= 90
        case '90-100':
          return lead.score >= 90 && lead.score <= 100
        default:
          return true
      }
    })()
    
    const matchesCompany = hasCompanyFilter === 'all' || 
      (hasCompanyFilter === 'yes' && lead.company) ||
      (hasCompanyFilter === 'no' && !lead.company)
    
    return matchesSearch && matchesStatus && matchesSource && matchesDateRange && matchesScoreRange && matchesCompany
  })

  const handleAddLead = async (formData: any) => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: formData.source || 'QueryWing Assistant'
        })
      })

      if (response.ok) {
        const data = await response.json()
        const newLead = {
          ...data.lead,
          score: data.lead.score || Math.floor(Math.random() * 30) + 70,
          capturedAt: new Date(data.lead.capturedAt).toLocaleDateString()
        }
        setLeads([newLead, ...leads])
        setShowAddModal(false)
        toast({
          title: "Success",
          description: "Lead created successfully!",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create lead')
      }
    } catch (error) {
      console.error('Error creating lead:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create lead. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditLead = async (formData: any) => {
    if (!editingLead) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/v1/leads/${editingLead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        const updatedLead = {
          ...data.lead,
          score: editingLead.score,
          capturedAt: editingLead.capturedAt
        }
        setLeads(leads.map(lead => 
          lead.id === editingLead.id ? updatedLead : lead
        ))
        setShowEditModal(false)
        setEditingLead(null)
        toast({
          title: "Success",
          description: "Lead updated successfully!",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update lead')
      }
    } catch (error) {
      console.error('Error updating lead:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update lead. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteLead = async (leadId: string) => {
    try {
      const response = await fetch(`/api/v1/leads/${leadId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setLeads(leads.filter(lead => lead.id !== leadId))
        setShowDeleteDialog(false)
        setCurrentLead(null)
        toast({
          title: "Success",
          description: "Lead deleted successfully!",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete lead')
      }
    } catch (error) {
      console.error('Error deleting lead:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete lead. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleBulkDelete = async () => {
    try {
      const deletePromises = selectedLeads.map(leadId => 
        fetch(`/api/v1/leads/${leadId}`, { method: 'DELETE' })
      )
      
      await Promise.all(deletePromises)
      setLeads(leads.filter(lead => !selectedLeads.includes(lead.id)))
      setSelectedLeads([])
      setShowBulkDeleteDialog(false)
      toast({
        title: "Success",
        description: `${selectedLeads.length} leads deleted successfully!`,
      })
    } catch (error) {
      console.error('Error deleting leads:', error)
      toast({
        title: "Error",
        description: "Failed to delete some leads. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (sourceFilter !== 'all') params.append('source', sourceFilter)
      
      const response = await fetch(`/api/v1/leads/export?${params.toString()}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "Success",
          description: "Leads exported successfully!",
        })
      } else {
        throw new Error('Failed to export leads')
      }
    } catch (error) {
      console.error('Error exporting leads:', error)
      toast({
        title: "Error",
        description: "Failed to export leads. Please try again.",
        variant: "destructive"
      })
    }
  }

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead)
    setShowEditModal(true)
  }

  const openDetailModal = (lead: Lead) => {
    setCurrentLead(lead)
    setShowDetailModal(true)
  }

  const handleScoreSave = async (leadId: string) => {
    // Validate score value
    if (editingScoreValue < 0 || editingScoreValue > 100) {
      toast({
        title: "Error",
        description: "Score must be between 0 and 100",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch(`/api/v1/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: editingScoreValue })
      })

      if (response.ok) {
        setLeads(leads.map(lead => 
          lead.id === leadId 
            ? { ...lead, score: editingScoreValue }
            : lead
        ))
        setEditingScoreId(null)
        toast({
          title: "Success",
          description: "Score updated successfully!",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update score')
      }
    } catch (error) {
      console.error('Error updating score:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update score. Please try again.",
        variant: "destructive"
      })
    }
  }

  const openDeleteDialog = (lead: Lead) => {
    setCurrentLead(lead)
    setShowDeleteDialog(true)
  }

  const updateLeadStatus = (leadId: string, newStatus: string) => {
    setLeads(leads.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus as any } : lead
    ))
  }

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length
  }

  const uniqueSources = Array.from(new Set(leads.map(lead => lead.source)))

  // Calculate lead insights and analytics
  const calculateLeadInsights = () => {
    if (leads.length === 0) return

    const totalLeads = leads.length
    const convertedLeads = leads.filter(l => l.status === 'converted').length
    const avgScore = leads.reduce((sum, l) => sum + l.score, 0) / totalLeads

    // Top sources by lead count
    const sourceCounts = leads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topSources = Object.entries(sourceCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }))

    // Score distribution
    const scoreRanges = {
      '90-100': leads.filter(l => l.score >= 90).length,
      '80-89': leads.filter(l => l.score >= 80 && l.score < 90).length,
      '70-79': leads.filter(l => l.score >= 70 && l.score < 80).length,
      '60-69': leads.filter(l => l.score >= 60 && l.score < 70).length,
      'Below 60': leads.filter(l => l.score < 60).length
    }

    // Monthly trend (last 6 months)
    const monthlyTrend = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthName = date.toLocaleString('default', { month: 'short' })
      const monthLeads = leads.filter(l => {
        const leadDate = new Date(l.capturedAt)
        return leadDate.getMonth() === date.getMonth() && leadDate.getFullYear() === date.getFullYear()
      }).length
      monthlyTrend.push({ month: monthName, count: monthLeads })
    }

    setLeadAnalytics({
      conversionRate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0,
      avgScore: Math.round(avgScore * 10) / 10,
      topSources,
      scoreDistribution: Object.entries(scoreRanges).map(([range, count]) => ({ range, count })),
      monthlyTrend
    })
  }

  useEffect(() => {
    calculateLeadInsights()
  }, [leads])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showAuth={false} showDashboardNav={true} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden mb-8">
          {/* Floating Background Elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full animate-pulse-slow"></div>
          <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-br from-purple-200/20 to-violet-200/20 rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-neutral-900 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                Lead Management
              </h1>
              <p className="text-gray-600 text-lg">Manage and track your captured leads with advanced insights</p>
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExport}
                className="border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchLeads}
                className="border-green-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
              >
                <Search className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button 
                size="sm" 
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {/* Total Leads Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden relative animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Leads</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stats.total}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* New Leads Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden relative animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">New</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-blue-600 text-sm font-bold">N</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Contacted Leads Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-yellow-50 to-amber-50 overflow-hidden relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Contacted</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.contacted}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-yellow-600 text-sm font-bold">C</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Qualified Leads Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden relative animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Qualified</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.qualified}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-orange-600 text-sm font-bold">Q</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Converted Leads Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden relative animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Converted</p>
                  <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-green-600 text-sm font-bold">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Lead Insights Section */}
        <Card className="mb-6 border-0 bg-gradient-to-br from-purple-50 to-violet-50 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-purple-800">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-violet-200 rounded-full flex items-center justify-center mr-3">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                Lead Insights & Analytics
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLeadInsights(!showLeadInsights)}
                className="border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
              >
                {showLeadInsights ? 'Hide Insights' : 'Show Insights'}
              </Button>
            </div>
          </CardHeader>
          
          {showLeadInsights && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Conversion Rate */}
                <div className="text-center p-4 bg-white rounded-xl border border-purple-200 shadow-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 text-lg font-bold">%</span>
                  </div>
                  <h4 className="text-2xl font-bold text-green-600 mb-1">{leadAnalytics.conversionRate.toFixed(1)}%</h4>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                </div>

                {/* Average Score */}
                <div className="text-center p-4 bg-white rounded-xl border border-purple-200 shadow-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-blue-600 mb-1">{leadAnalytics.avgScore}</h4>
                  <p className="text-sm text-gray-600">Average Score</p>
                </div>

                {/* Top Source */}
                <div className="text-center p-4 bg-white rounded-xl border border-purple-200 shadow-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 text-lg font-bold">🔥</span>
                  </div>
                  <h4 className="text-lg font-bold text-purple-600 mb-1">
                    {leadAnalytics.topSources[0]?.source || 'N/A'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {leadAnalytics.topSources[0]?.count || 0} leads
                  </p>
                </div>

                {/* Monthly Trend */}
                <div className="text-center p-4 bg-white rounded-xl border border-purple-200 shadow-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-orange-600 text-lg font-bold">📈</span>
                  </div>
                  <h4 className="text-lg font-bold text-orange-600 mb-1">
                    {leadAnalytics.monthlyTrend[leadAnalytics.monthlyTrend.length - 1]?.count || 0}
                  </h4>
                  <p className="text-sm text-gray-600">This Month</p>
                </div>
              </div>

              {/* Detailed Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Top Sources Chart */}
                <div className="bg-white rounded-xl border border-purple-200 p-4">
                  <h5 className="font-semibold text-gray-800 mb-3">Top Lead Sources</h5>
                  <div className="space-y-3">
                    {leadAnalytics.topSources.slice(0, 5).map((source, index) => (
                      <div key={source.source} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{source.source}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-400 to-violet-500 rounded-full transition-all duration-500"
                              style={{ width: `${(source.count / Math.max(...leadAnalytics.topSources.map(s => s.count))) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-800 w-8 text-right">{source.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score Distribution */}
                <div className="bg-white rounded-xl border border-purple-200 p-4">
                  <h5 className="font-semibold text-gray-800 mb-3">Score Distribution</h5>
                  <div className="space-y-3">
                    {leadAnalytics.scoreDistribution.map((score, index) => (
                      <div key={score.range} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{score.range}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500"
                              style={{ width: `${(score.count / Math.max(...leadAnalytics.scoreDistribution.map(s => s.count))) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-800 w-8 text-right">{score.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Enhanced Filters and Search */}
        <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-gray-50 to-blue-50 animate-slide-in-left">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Enhanced Search Bar */}
                <div className="flex-1">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      placeholder="🔍 Search leads by name, email, company, or source..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-200 placeholder:text-gray-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                  </div>
                </div>
                
                {/* Enhanced Filters */}
                <div className="flex gap-3">
                  <div className="relative group">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="appearance-none px-4 py-3 pr-10 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 cursor-pointer hover:bg-white/90"
                    >
                      <option value="all">📊 All Status</option>
                      <option value="new">🆕 New</option>
                      <option value="contacted">📞 Contacted</option>
                      <option value="qualified">✅ Qualified</option>
                      <option value="converted">🎯 Converted</option>
                      <option value="lost">❌ Lost</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-400 rounded-full pointer-events-none" />
                  </div>
                  
                  <div className="relative group">
                    <select
                      value={sourceFilter}
                      onChange={(e) => setSourceFilter(e.target.value)}
                      className="appearance-none px-4 py-3 pr-10 bg-white/80 backdrop-blur-sm border border-green-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200 cursor-pointer hover:bg-white/90"
                    >
                      <option value="all">🌐 All Sources</option>
                      {uniqueSources.map(source => (
                        <option key={source} value={source}>🤖 {source}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-400 rounded-full pointer-events-none" />
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {showFilters ? 'Hide' : 'More'} Filters
                  </Button>
                  
                  {(statusFilter !== 'all' || sourceFilter !== 'all' || dateRangeFilter !== 'all' || scoreRangeFilter !== 'all' || hasCompanyFilter !== 'all') && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setStatusFilter('all')
                        setSourceFilter('all')
                        setDateRangeFilter('all')
                        setScoreRangeFilter('all')
                        setHasCompanyFilter('all')
                        setSearchTerm('')
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                    >
                      ✕ Clear All
                    </Button>
                  )}
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="pt-4 border-t border-gray-200 animate-fade-in-up">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📅 Date Range
                      </label>
                      <select 
                        value={dateRangeFilter}
                        onChange={(e) => setDateRangeFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      >
                        <option value="all">All Time</option>
                        <option value="7days">Last 7 days</option>
                        <option value="30days">Last 30 days</option>
                        <option value="90days">Last 90 days</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ⭐ Score Range
                      </label>
                      <select 
                        value={scoreRangeFilter}
                        onChange={(e) => setScoreRangeFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      >
                        <option value="all">All Scores</option>
                        <option value="70-80">70-80</option>
                        <option value="80-90">80-90</option>
                        <option value="90-100">90-100</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🏢 Has Company
                      </label>
                      <select 
                        value={hasCompanyFilter}
                        onChange={(e) => setHasCompanyFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      >
                        <option value="all">All</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Filters Display */}
              {(statusFilter !== 'all' || sourceFilter !== 'all' || dateRangeFilter !== 'all' || scoreRangeFilter !== 'all' || hasCompanyFilter !== 'all' || searchTerm) && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
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
                    {sourceFilter !== 'all' && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-3 py-1">
                        🌐 Source: {sourceFilter}
                      </Badge>
                    )}
                    {dateRangeFilter !== 'all' && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 px-3 py-1">
                        📅 Date: {dateRangeFilter === '7days' ? 'Last 7 days' : dateRangeFilter === '30days' ? 'Last 30 days' : 'Last 90 days'}
                      </Badge>
                    )}
                    {scoreRangeFilter !== 'all' && (
                      <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 px-3 py-1">
                        ⭐ Score: {scoreRangeFilter}
                      </Badge>
                    )}
                    {hasCompanyFilter !== 'all' && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 px-3 py-1">
                        🏢 Company: {hasCompanyFilter === 'yes' ? 'Yes' : 'No'}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Bulk Actions */}
        {selectedLeads.length > 0 && (
          <div className="flex items-center gap-3 mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-lg animate-fade-in-up">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">{selectedLeads.length}</span>
              </div>
              <span className="text-sm font-medium text-blue-700">
                {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkDeleteDialog(true)}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLeads([])}
                className="border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              >
                ✕ Clear Selection
              </Button>
            </div>
          </div>
        )}

        {/* Enhanced Leads Table */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-purple-100 to-violet-200 rounded-full animate-bounce"></div>
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Your Leads...</h3>
                <p className="text-gray-600">Fetching lead data and analytics</p>
                <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto mt-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLeads(filteredLeads.map(lead => lead.id))
                            } else {
                              setSelectedLeads([])
                            }
                          }}
                          className="rounded border-gray-300 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        👤 Lead
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        🏢 Company
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        🌐 Source
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        📊 Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        ⭐ Score
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        📅 Captured
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        🎯 Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredLeads.map((lead, index) => (
                      <tr 
                        key={lead.id} 
                        className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 animate-fade-in-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedLeads.includes(lead.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLeads([...selectedLeads, lead.id])
                              } else {
                                setSelectedLeads(selectedLeads.filter(id => id !== lead.id))
                              }
                            }}
                            className="rounded border-gray-300 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center shadow-sm">
                                <span className="text-blue-600 font-bold text-lg">
                                  {lead.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">{lead.name}</div>
                              <div className="text-sm text-gray-500">{lead.email}</div>
                              {lead.phone && (
                                <div className="text-sm text-gray-500 flex items-center mt-1">
                                  <Phone className="w-3 h-3 mr-1 text-blue-400" />
                                  {lead.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {lead.company ? (
                            <div className="flex items-center">
                              <Building className="w-4 h-4 text-blue-400 mr-2" />
                              <span className="text-sm font-medium text-gray-900">{lead.company}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                            <span className="text-sm font-medium text-gray-900">{lead.source}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant="secondary"
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                              lead.status === 'new' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                              lead.status === 'qualified' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                              lead.status === 'converted' ? 'bg-green-100 text-green-800 border border-green-200' :
                              'bg-red-100 text-red-800 border border-red-200'
                            }`}
                          >
                            {lead.status === 'new' && '🆕'}
                            {lead.status === 'contacted' && '📞'}
                            {lead.status === 'qualified' && '✅'}
                            {lead.status === 'converted' && '🎯'}
                            {lead.status === 'lost' && '❌'}
                            {' '}{lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-2" />
                            {editingScoreId === lead.id ? (
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={editingScoreValue}
                                  onChange={(e) => setEditingScoreValue(parseInt(e.target.value) || 0)}
                                  className="w-16 h-8 text-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                                  autoFocus
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleScoreSave(lead.id)}
                                  className="h-8 px-2 bg-green-600 hover:bg-green-700 text-white"
                                >
                                  ✓
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingScoreId(null)}
                                  className="h-8 px-2 border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  ✕
                                </Button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingScoreId(lead.id)
                                  setEditingScoreValue(lead.score)
                                }}
                                className="text-sm font-bold text-gray-900 hover:text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition-all duration-200 hover:shadow-sm"
                              >
                                {lead.score}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-blue-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{lead.capturedAt}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDetailModal(lead)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(lead)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(lead)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredLeads.length === 0 && (
                  <div className="p-12 text-center bg-gradient-to-br from-gray-50 to-blue-50">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Users className="w-10 h-10 text-blue-600" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-100 to-violet-200 rounded-full animate-bounce"></div>
                      <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all' ? 'No leads found' : 'Ready to Capture Your First Lead?'}
                    </h3>
                    <p className="text-gray-600 mb-4 max-w-md mx-auto">
                      {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all'
                        ? 'Try adjusting your search criteria or filters to find what you\'re looking for' 
                        : 'Leads will appear here when captured from your chatbots. Start building your lead pipeline!'
                      }
                    </p>
                    {!searchTerm && statusFilter === 'all' && sourceFilter === 'all' && (
                      <Button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Lead
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Lead Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Lead"
        size="lg"
      >
        <LeadForm
          mode="create"
          onSubmit={handleAddLead}
          onCancel={() => setShowAddModal(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Edit Lead Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingLead(null)
        }}
        title="Edit Lead"
        size="lg"
      >
        {editingLead && (
          <LeadForm
            mode="edit"
            initialData={{
              name: editingLead.name,
              email: editingLead.email,
              phone: editingLead.phone || '',
              company: editingLead.company || '',
              status: editingLead.status,
              source: editingLead.source,
              tags: editingLead.tags,
              notes: editingLead.notes || ''
            }}
            onSubmit={handleEditLead}
            onCancel={() => {
              setShowEditModal(false)
              setEditingLead(null)
            }}
            isLoading={isSubmitting}
          />
        )}
      </Modal>

      {/* Lead Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setCurrentLead(null)
        }}
        title="Lead Details"
        size="xl"
      >
        {currentLead && (
          <LeadDetailView
            lead={currentLead}
            onEdit={() => {
              setShowDetailModal(false)
              openEditModal(currentLead)
            }}
            onDelete={() => {
              setShowDetailModal(false)
              openDeleteDialog(currentLead)
            }}
            onClose={() => {
              setShowDetailModal(false)
              setCurrentLead(null)
            }}
          />
        )}
      </Modal>

      {/* Delete Lead Dialog */}
      <Dialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setCurrentLead(null)
        }}
        onConfirm={() => currentLead && handleDeleteLead(currentLead.id)}
        title="Delete Lead"
        message={`Are you sure you want to delete ${currentLead?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Bulk Delete Dialog */}
      <Dialog
        isOpen={showBulkDeleteDialog}
        onClose={() => setShowBulkDeleteDialog(false)}
        onConfirm={handleBulkDelete}
        title="Delete Multiple Leads"
        message={`Are you sure you want to delete ${selectedLeads.length} leads? This action cannot be undone.`}
        confirmText="Delete All"
        variant="danger"
      />
    </div>
  )
}
