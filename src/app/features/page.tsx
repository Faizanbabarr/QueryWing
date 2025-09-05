"use client"

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageCircle, 
  Bot, 
  BarChart3, 
  Zap, 
  Users, 
  Shield, 
  Globe, 
  Smartphone, 
  Headphones, 
  Target, 
  Rocket, 
  TrendingUp, 
  Lock, 
  CheckCircle, 
  ArrowRight, 
  Play,
  Sparkles,
  Brain,
  FileText,
  Database,
  Code,
  Palette,
  Settings,
  Monitor,
  SmartphoneIcon,
  Globe2,
  ZapIcon,
  BarChart,
  UserCheck,
  MessageSquare,
  FileSearch,
  Cpu,
  Network,
  Clock,
  Award
} from 'lucide-react'

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState('ai-chatbot')
  const [isVisible, setIsVisible] = useState(false)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    setIsVisible(true)
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(entry.target.id))
          }
        })
      },
      { threshold: 0.1 }
    )

    // Observe all sections
    const sections = document.querySelectorAll('section[id]')
    sections.forEach(section => observer.observe(section))
    
    return () => observer.disconnect()
  }, [])

  const featureCategories = [
    {
      id: 'ai-chatbot',
      title: 'AI Chatbot',
      icon: <Bot className="w-6 h-6" />,
      description: 'Intelligent AI-powered chatbots that learn from your content'
    },
    {
      id: 'lead-generation',
      title: 'Lead Generation',
      icon: <Users className="w-6 h-6" />,
      description: 'Automatically capture and qualify leads through conversations'
    },
    {
      id: 'live-agent',
      title: 'Live Agent',
      icon: <Headphones className="w-6 h-6" />,
      description: 'Seamless handoff to human agents for complex queries'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: <BarChart3 className="w-6 h-6" />,
      description: 'Comprehensive insights into customer interactions and performance'
    }
  ]

  const aiFeatures = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'Content Learning',
      description: 'AI learns from your documents, websites, and knowledge base to provide accurate, contextual responses.',
      benefits: ['Instant knowledge base training', 'Context-aware responses', 'Multi-format content support']
    },
    {
      icon: <Cpu className="w-8 h-8" />,
      title: 'Natural Language Processing',
      description: 'Advanced NLP capabilities that understand user intent and provide human-like conversations.',
      benefits: ['Intent recognition', 'Contextual understanding', 'Multi-language support']
    },
    {
      icon: <FileSearch className="w-8 h-8" />,
      title: 'Smart Search',
      description: 'Intelligent search through your content to find the most relevant information for user queries.',
      benefits: ['Semantic search', 'Relevance scoring', 'Fast response times']
    }
  ]

  const leadFeatures = [
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Automatic Lead Capture',
      description: 'Intelligently identify and capture lead information during conversations without disrupting the user experience.',
      benefits: ['Seamless data collection', 'Qualification scoring', 'CRM integration ready']
    },
    {
      icon: <UserCheck className="w-8 h-8" />,
      title: 'Lead Qualification',
      description: 'AI-powered lead scoring based on conversation quality, engagement, and intent signals.',
      benefits: ['Real-time scoring', 'Behavioral analysis', 'Priority ranking']
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: 'Contact Management',
      description: 'Organized lead database with detailed conversation history and interaction tracking.',
      benefits: ['Centralized storage', 'Conversation history', 'Export capabilities']
    }
  ]

  const liveAgentFeatures = [
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'Seamless Handoff',
      description: 'Smooth transition from AI to human agents when complex queries require human intervention.',
      benefits: ['Context preservation', 'Instant transfer', 'Agent availability status']
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Agent Management',
      description: 'Comprehensive tools for managing live agents, their availability, and performance metrics.',
      benefits: ['Agent scheduling', 'Performance tracking', 'Workload distribution']
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Real-time Communication',
      description: 'Live chat interface for agents to respond to customer queries in real-time with full context.',
      benefits: ['Instant messaging', 'Context sharing', 'Response templates']
    }
  ]

  const analyticsFeatures = [
    {
      icon: <BarChart className="w-8 h-8" />,
      title: 'Conversation Analytics',
      description: 'Deep insights into customer interactions, query patterns, and satisfaction metrics.',
      benefits: ['Query analysis', 'Satisfaction tracking', 'Trend identification']
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Performance Metrics',
      description: 'Comprehensive dashboard showing bot performance, response times, and success rates.',
      benefits: ['Response time tracking', 'Success rate analysis', 'Performance optimization']
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'ROI Tracking',
      description: 'Measure the business impact of your chatbot implementation with detailed cost-benefit analysis.',
      benefits: ['Cost savings', 'Lead value tracking', 'Efficiency metrics']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header showAuth={true} showDashboardNav={false} />

      {/* Hero Section */}
      <section id="hero" className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-6 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 transition-colors">
              <Sparkles className="w-4 h-4 mr-2" />
              Feature Overview
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              Powerful Features
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                That Drive Results
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover how QueryWing's comprehensive feature set transforms customer support, 
              generates leads, and provides actionable insights to grow your business.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/demo">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <Play className="w-5 h-5 mr-2" />
                  Try Demo
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Categories Tabs */}
      <section id="feature-tabs" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our comprehensive feature set organized into logical categories
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-gray-100 p-2 rounded-xl">
              {featureCategories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 rounded-lg transition-all duration-300"
                >
                  {category.icon}
                  <span className="hidden sm:inline">{category.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="ai-chatbot" className="mt-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {aiFeatures.map((feature, index) => (
                  <Card 
                    key={index}
                    className={`group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 ${
                      visibleSections.has('feature-tabs') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                    style={{ transitionDelay: `${index * 200}ms` }}
                  >
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-center mb-6 leading-relaxed">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="lead-generation" className="mt-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {leadFeatures.map((feature, index) => (
                  <Card 
                    key={index}
                    className={`group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-green-50 to-emerald-50 ${
                      visibleSections.has('feature-tabs') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                    style={{ transitionDelay: `${index * 200}ms` }}
                  >
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-center mb-6 leading-relaxed">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="live-agent" className="mt-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {liveAgentFeatures.map((feature, index) => (
                  <Card 
                    key={index}
                    className={`group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-purple-50 to-violet-50 ${
                      visibleSections.has('feature-tabs') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                    style={{ transitionDelay: `${index * 200}ms` }}
                  >
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-violet-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-center mb-6 leading-relaxed">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {analyticsFeatures.map((feature, index) => (
                  <Card 
                    key={index}
                    className={`group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-orange-50 to-amber-50 ${
                      visibleSections.has('feature-tabs') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                    style={{ transitionDelay: `${index * 200}ms` }}
                  >
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-center mb-6 leading-relaxed">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Technical Features */}
      <section id="technical-features" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Technical Excellence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with modern technologies for reliability, security, and performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Shield className="w-8 h-8" />, title: "Enterprise Security", description: "SOC 2 compliant with end-to-end encryption" },
              { icon: <Globe className="w-8 h-8" />, title: "Global CDN", description: "Lightning-fast response times worldwide" },
              { icon: <Code className="w-8 h-8" />, title: "Easy Integration", description: "Simple API and widget integration" },
              { icon: <Monitor className="w-8 h-8" />, title: "Multi-Platform", description: "Works on web, mobile, and desktop" }
            ].map((feature, index) => (
              <div 
                key={index}
                className={`text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${
                  visibleSections.has('technical-features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Experience These Features?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Start your free trial today and see how QueryWing can transform your customer support
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6">
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Background Animation Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full animate-pulse-slow"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  )
}


