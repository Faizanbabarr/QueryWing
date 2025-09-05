"use client"
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  FileText, 
  Plus, 
  Search,
  File,
  Link as LinkIcon,
  Trash2,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import Header from '@/components/Header'

interface ContentItem {
  id: string
  name: string
  type: 'document' | 'website' | 'manual'
  status: 'completed' | 'processing' | 'failed'
  size?: string
  url?: string
  uploadedAt: string
  pages?: number
  words?: number
  userId: string
}

export default function ContentPage() {
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
      
      .animate-fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
      }
      
      .animate-slide-in-left {
        animation: slideInLeft 0.6s ease-out forwards;
      }
      
      .animate-pulse-slow {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const pollingRef = useRef<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [faqs, setFaqs] = useState<{id:string;question:string;answer:string}[]>([])
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' })
  const [uploadType, setUploadType] = useState<'document' | 'website' | 'manual'>('document')
  const [uploadData, setUploadData] = useState({
    name: '',
    url: '',
    content: '',
    file: null as File | null
  })
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('querywing-user')
    if (!userData) {
      router.push('/auth/sign-in')
      return
    }

    fetchContent(true)

    // visibility-aware polling
    const startPolling = () => {
      stopPolling()
      const tick = async () => {
        await fetchContent(false)
        pollingRef.current = window.setTimeout(tick, 5000)
      }
      pollingRef.current = window.setTimeout(tick, 5000)
    }
    const stopPolling = () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current)
        pollingRef.current = null
      }
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') startPolling()
      else stopPolling()
    }
    document.addEventListener('visibilitychange', onVisibility)
    startPolling()
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      stopPolling()
    }
  }, [])

  const fetchContent = async (initial = false) => {
    try {
      if (initial) setLoading(true)
      const response = await fetch('/api/v1/content', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setContent(data.documents || [])
      }
      const faqRes = await fetch('/api/v1/faqs', { cache: 'no-store' })
      if (faqRes.ok) {
        const data = await faqRes.json()
        setFaqs(data.faqs || [])
      }
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      if (initial) setLoading(false)
    }
  }

  const uploadContent = async () => {
    if (uploading) return
    setUploading(true)
    try {
      const response = await fetch('/api/v1/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: uploadData.name,
          type: uploadType,
          url: uploadData.url,
          content: uploadData.content,
          size: uploadData.file ? `${(uploadData.file.size / 1024 / 1024).toFixed(2)} MB` : undefined
        })
      })

      if (response.ok) {
        const data = await response.json()
        // refresh from server to avoid duplicates
        await fetchContent(true)
        setShowUploadForm(false)
        setUploadData({ name: '', url: '', content: '', file: null })
      }
    } catch (error) {
      console.error('Error uploading content:', error)
    } finally { setUploading(false) }
  }

  const addFaq = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return
    try {
      const res = await fetch('/api/v1/faqs', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(newFaq) })
      if (res.ok) {
        setNewFaq({ question:'', answer:'' })
        await fetchContent(false)
      }
    } catch (e) { console.error('Failed to add FAQ', e) }
  }

  const deleteFaq = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/faqs?id=${encodeURIComponent(id)}`, { method:'DELETE' })
      if (res.ok) await fetchContent(false)
    } catch (e) { console.error('Failed to delete FAQ', e) }
  }

  const deleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return
    try {
      const res = await fetch(`/api/v1/content?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchContent(true)
      }
    } catch (error) {
      console.error('Error deleting content:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <File className="w-4 h-4" />
      case 'website':
        return <LinkIcon className="w-4 h-4" />
      case 'manual':
        return <FileText className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const filteredContent = content.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || item.type === typeFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <FileText className="w-10 h-10 text-blue-600 animate-bounce" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-100 to-violet-200 rounded-full flex items-center justify-center animate-bounce">
              <File className="w-4 h-4 text-purple-600" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
              <LinkIcon className="w-3 h-3 text-green-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Knowledge Base...</h3>
          <p className="text-gray-600 mb-4">Fetching content and FAQs</p>
          <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header currentPage="content" showAuth={true} showDashboardNav={true} />

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Page Header */}
        <div className="relative overflow-hidden mb-8">
          {/* Floating Background Elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full animate-pulse-slow"></div>
          <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-br from-purple-200/20 to-violet-200/20 rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-neutral-900 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                Knowledge Base
              </h1>
              <p className="text-neutral-600 text-lg">Upload and manage content for your AI assistants</p>
            </div>
            <Button 
              onClick={() => setShowUploadForm(true)} 
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <Plus className="w-4 h-4" />
              <span>Add Content</span>
            </Button>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Documents Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden relative animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{content.length}</h3>
                  <p className="text-sm text-blue-600 font-medium">Total Documents</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processed Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden relative animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{content.filter(c => c.status === 'completed').length}</h3>
                  <p className="text-sm text-green-600 font-medium">Processed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-yellow-50 to-amber-50 overflow-hidden relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">{content.filter(c => c.status === 'processing').length}</h3>
                  <p className="text-sm text-yellow-600 font-medium">Processing</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Words Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-purple-50 to-violet-50 overflow-hidden relative animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-violet-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <File className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">{content.reduce((sum, c) => sum + (c.words || 0), 0).toLocaleString()}</h3>
                  <p className="text-sm text-purple-600 font-medium">Total Words</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Upload Form */}
        {showUploadForm && (
          <Card className="mb-8 border-0 bg-gradient-to-br from-white to-blue-50/30 shadow-xl animate-fade-in-up">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-gray-800">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mr-3">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                Add New Content
              </CardTitle>
              <CardDescription className="text-gray-600">Upload documents, crawl websites, or add manual content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Enhanced Content Type Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700">Content Type</label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setUploadType('document')}
                      className={`group p-6 border-2 rounded-xl text-center transition-all duration-300 transform hover:-translate-y-1 ${
                        uploadType === 'document' 
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg' 
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-all duration-300 ${
                        uploadType === 'document' 
                          ? 'bg-gradient-to-br from-blue-100 to-indigo-200 text-blue-600' 
                          : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                      }`}>
                        <File className="w-6 h-6" />
                      </div>
                      <div className="font-medium text-gray-900">Document</div>
                      <div className="text-sm text-gray-600">PDF, DOC, TXT</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadType('website')}
                      className={`group p-6 border-2 rounded-xl text-center transition-all duration-300 transform hover:-translate-y-1 ${
                        uploadType === 'website' 
                          ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg' 
                          : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                      }`}
                    >
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-all duration-300 ${
                        uploadType === 'website' 
                          ? 'bg-gradient-to-br from-green-100 to-emerald-200 text-green-600' 
                          : 'bg-gray-100 text-gray-600 group-hover:bg-green-100 group-hover:text-green-600'
                      }`}>
                        <LinkIcon className="w-6 h-6" />
                      </div>
                      <div className="font-medium text-gray-900">Website</div>
                      <div className="text-sm text-gray-600">Crawl URL</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadType('manual')}
                      className={`group p-6 border-2 rounded-xl text-center transition-all duration-300 transform hover:-translate-y-1 ${
                        uploadType === 'manual' 
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-violet-50 shadow-lg' 
                          : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                      }`}
                    >
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-all duration-300 ${
                        uploadType === 'manual' 
                          ? 'bg-gradient-to-br from-purple-100 to-violet-200 text-purple-600' 
                          : 'bg-gray-100 text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-600'
                      }`}>
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="font-medium text-gray-900">Manual</div>
                      <div className="text-sm text-gray-600">Text content</div>
                    </button>
                  </div>
                </div>

                {/* Enhanced Content Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Content Name</label>
                    <Input
                      value={uploadData.name}
                      onChange={(e) => setUploadData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter content name"
                      className="border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                    />
                  </div>

                  {uploadType === 'website' && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Website URL</label>
                      <Input
                        value={uploadData.url}
                        onChange={(e) => setUploadData(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="https://example.com"
                        className="border-gray-200 focus:border-green-400 focus:ring-green-400"
                      />
                    </div>
                  )}

                  {uploadType === 'document' && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Upload File</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                        <Input
                          type="file"
                          onChange={(e) => setUploadData(prev => ({ 
                            ...prev, 
                            file: e.target.files ? e.target.files[0] : null 
                          }))}
                          accept=".pdf,.doc,.docx,.txt"
                          className="border-0 focus:ring-0"
                        />
                        <p className="text-sm text-gray-500 mt-2">Drag and drop or click to browse</p>
                      </div>
                    </div>
                  )}

                  {uploadType === 'manual' && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Content</label>
                      <Textarea
                        value={uploadData.content}
                        onChange={(e) => setUploadData(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Enter your content here..."
                        rows={6}
                        className="border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                      />
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button 
                    onClick={uploadContent} 
                    disabled={!uploadData.name || uploading}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {uploading ? 'Uploading...' : 'Upload Content'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUploadForm(false)}
                    className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Filters */}
        <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-gray-50 to-blue-50 animate-slide-in-left">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              {/* Enhanced Search Bar */}
              <div className="flex-1 w-full lg:w-auto">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                  <Input
                    placeholder="🔍 Search content by name, type, or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-200 placeholder:text-gray-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                </div>
              </div>

              {/* Enhanced Filters */}
              <div className="flex flex-wrap gap-3">
                {/* Type Filter */}
                <div className="relative group">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="appearance-none px-4 py-3 pr-10 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 cursor-pointer hover:bg-white/90"
                  >
                    <option value="all">🌐 All Types</option>
                    <option value="document">📄 Documents</option>
                    <option value="website">🔗 Websites</option>
                    <option value="manual">✍️ Manual</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-400 rounded-full pointer-events-none" />
                </div>

                {/* Status Filter */}
                <div className="relative group">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none px-4 py-3 pr-10 bg-white/80 backdrop-blur-sm border border-green-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200 cursor-pointer hover:bg-white/90"
                  >
                    <option value="all">📊 All Status</option>
                    <option value="completed">✅ Completed</option>
                    <option value="processing">⏳ Processing</option>
                    <option value="failed">❌ Failed</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-400 rounded-full pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all') && (
              <div className="mt-4 flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                    🔍 Search: "{searchTerm}"
                  </Badge>
                )}
                {typeFilter !== 'all' && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-3 py-1">
                    📄 Type: {typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
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
                  onClick={() => { setSearchTerm(''); setTypeFilter('all'); setStatusFilter('all'); }}
                  className="text-gray-500 hover:text-gray-700 px-2 py-1 h-auto"
                >
                  ✕ Clear All
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item, index) => (
            <Card 
              key={item.id} 
              className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-gray-50/50 overflow-hidden relative animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Status Indicator */}
              <div className={`absolute top-4 right-4 w-3 h-3 rounded-full animate-pulse ${
                item.status === 'completed' ? 'bg-green-500' : 
                item.status === 'processing' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                      item.type === 'document' ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600' :
                      item.type === 'website' ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-600' :
                      'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600'
                    }`}>
                      {getTypeIcon(item.type)}
                    </div>
                    <CardTitle className="text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                      {item.name}
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-gray-600">
                  <span className="capitalize">{item.type}</span> • {new Date(item.uploadedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-4">
                {/* Enhanced Content Details */}
                <div className="space-y-3">
                  {item.size && (
                    <div className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Size:</span>
                      <span className="font-semibold text-gray-900">{item.size}</span>
                    </div>
                  )}
                  {item.url && (
                    <div className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">URL:</span>
                      <span className="truncate max-w-[150px] text-blue-600 font-medium">{item.url}</span>
                    </div>
                  )}
                  {item.pages && (
                    <div className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Pages:</span>
                      <span className="font-semibold text-gray-900">{item.pages}</span>
                    </div>
                  )}
                  {item.words && (
                    <div className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Words:</span>
                      <span className="font-semibold text-gray-900">{item.words.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Enhanced Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => window.open(item.url || '#', '_blank')}
                      className="border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (item.url) {
                          const a = document.createElement('a')
                          a.href = item.url
                          a.target = '_blank'
                          a.download = ''
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                        } else {
                          window.open('/api/v1/content/export', '_blank')
                        }
                      }}
                      className="border-green-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteContent(item.id)}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced FAQ Management */}
        <div className="mt-12">
          <Card className="border-0 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-yellow-800">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-full flex items-center justify-center mr-3">
                  <FileText className="w-5 h-5 text-yellow-600" />
                </div>
                FAQ Management
              </CardTitle>
              <CardDescription className="text-yellow-700">Add common questions and answers. The chatbot will use these before AI.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Question</label>
                  <Input 
                    value={newFaq.question} 
                    onChange={e=>setNewFaq(prev=>({...prev,question:e.target.value}))} 
                    placeholder="e.g., What is your refund policy?" 
                    className="border-gray-200 focus:border-yellow-400 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Answer</label>
                  <Input 
                    value={newFaq.answer} 
                    onChange={e=>setNewFaq(prev=>({...prev,answer:e.target.value}))} 
                    placeholder="e.g., We offer a 14-day refund for..." 
                    className="border-gray-200 focus:border-yellow-400 focus:ring-yellow-400"
                  />
                </div>
              </div>
              <Button 
                onClick={addFaq} 
                disabled={!newFaq.question.trim() || !newFaq.answer.trim()}
                className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add FAQ
              </Button>

              <div className="mt-8 space-y-4">
                {faqs.map((f, index) => (
                  <div 
                    key={f.id} 
                    className="rounded-xl border border-yellow-200 bg-white p-5 flex items-start justify-between hover:shadow-md transition-all duration-200 animate-fade-in-up"
                    style={{ animationDelay: `${(index + 1) * 100}ms` }}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-2 flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                        {f.question}
                      </div>
                      <div className="text-sm text-gray-600 ml-5">{f.answer}</div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={()=>deleteFaq(f.id)} 
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200 ml-4"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                ))}
                {faqs.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-8 h-8 text-yellow-600" />
                    </div>
                    <p className="text-sm text-gray-500">No FAQs yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Add your first FAQ above</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Empty State */}
        {filteredContent.length === 0 && (
          <div className="text-center py-16">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <FileText className="w-12 h-12 text-blue-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center animate-bounce">
                <Plus className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' ? 'No content found' : 'Ready to Add Your First Content?'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or filters to find what you\'re looking for'
                : 'Start building your knowledge base by uploading documents, crawling websites, or adding manual content. Your AI assistants will use this information to provide better responses.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all') && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setTypeFilter('all')
                    setStatusFilter('all')
                  }}
                  className="px-6 py-3"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              )}
            </div>
            
            {/* Feature Highlights */}
            {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && (
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <File className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-blue-900 mb-2">Document Upload</h4>
                  <p className="text-sm text-blue-700">Upload PDFs, DOCs, and text files</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LinkIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-green-900 mb-2">Website Crawling</h4>
                  <p className="text-sm text-green-700">Automatically extract content from URLs</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-purple-900 mb-2">Manual Entry</h4>
                  <p className="text-sm text-purple-700">Add custom text content directly</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
