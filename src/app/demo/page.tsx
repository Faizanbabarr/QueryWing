"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowRight, 
  Code, 
  Copy, 
  Check, 
  MessageCircle, 
  Bot, 
  Zap, 
  Users, 
  BarChart3, 
  Globe, 
  Smartphone, 
  Shield, 
  Play, 
  Sparkles,
  Star,
  Clock,
  Target,
  TrendingUp,
  Headphones,
  FileText,
  Settings,
  Palette
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import DemoChat from './DemoChat'
import Header from '@/components/Header'

export default function DemoPage() {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('live-demo')
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

  const integrationCode = `<script async src="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/widget.js" data-bot-id="YOUR_BOT_ID"></script>`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(integrationCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const demoFeatures = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Lightning Fast',
      description: 'Get instant responses to customer questions with AI-powered answers',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Always Available',
      description: '24/7 customer support without the need for human agents',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Smart Analytics',
      description: 'Track conversations, popular questions, and conversion rates',
      color: 'from-purple-500 to-purple-600'
    }
  ]

  const integrationSteps = [
    {
      step: '01',
      title: 'Get Your Bot ID',
      description: 'Sign up and create your first AI chatbot to get a unique bot ID',
      icon: <Bot className="w-6 h-6" />
    },
    {
      step: '02',
      title: 'Add the Code',
      description: 'Copy and paste the integration code into your website',
      icon: <Code className="w-6 h-6" />
    },
    {
      step: '03',
      title: 'Customize & Deploy',
      description: 'Customize the appearance and deploy your chatbot instantly',
      icon: <Settings className="w-6 h-6" />
    }
  ]

  const customizationOptions = [
    {
      icon: <Palette className="w-6 h-6" />,
      title: 'Brand Colors',
      description: 'Match your brand with custom colors and themes'
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Welcome Message',
      description: 'Set a custom welcome message for your visitors'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Multi-language',
      description: 'Support multiple languages for global audiences'
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: 'Mobile Optimized',
      description: 'Responsive design that works on all devices'
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
              Live Demo
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              See QueryWing
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                in Action
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience how our AI assistant can help your customers find answers instantly. 
              Try the live demo below and see the power of intelligent customer support.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
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

      {/* Demo Section */}
      <section id="demo" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Interactive Demo
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Try our AI chatbot and see how it handles real customer questions
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-2 rounded-xl">
              <TabsTrigger value="live-demo" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 rounded-lg transition-all duration-300">
                <Play className="w-4 h-4 mr-2" />
                Live Demo
              </TabsTrigger>
              <TabsTrigger value="integration" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 rounded-lg transition-all duration-300">
                <Code className="w-4 h-4 mr-2" />
                Integration
              </TabsTrigger>
              <TabsTrigger value="customization" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 rounded-lg transition-all duration-300">
                <Settings className="w-4 h-4 mr-2" />
                Customization
              </TabsTrigger>
            </TabsList>

            <TabsContent value="live-demo" className="mt-12">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Live Demo */}
                <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-blue-900">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <span>Live Demo</span>
                    </CardTitle>
                    <CardDescription className="text-blue-700">
                      Chat with our AI assistant to see how it responds to real questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white rounded-lg p-4 min-h-[500px] relative shadow-inner">
                      <DemoChat />
                    </div>
                  </CardContent>
                </Card>

                {/* Demo Features */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose QueryWing?</h3>
                  {demoFeatures.map((feature, index) => (
                    <Card 
                      key={index}
                      className={`border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                        visibleSections.has('demo') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                      }`}
                      style={{ transitionDelay: `${index * 200}ms` }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center text-white flex-shrink-0`}>
                            {feature.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integration" className="mt-12">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Integration Code */}
                <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-green-900">
                      <Code className="w-6 h-6" />
                      <span>Quick Integration</span>
                    </CardTitle>
                    <CardDescription className="text-green-700">
                      Add QueryWing to your website in just one line of code
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Code Snippet */}
                      <div className="bg-gray-900 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">HTML</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={copyToClipboard}
                            className="text-gray-400 hover:text-white"
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <pre className="text-green-400 text-sm overflow-x-auto">
                          <code>{integrationCode}</code>
                        </pre>
                      </div>

                      {/* Features */}
                      <div className="grid grid-cols-2 gap-3">
                        <Badge variant="secondary" className="justify-center bg-green-100 text-green-700 border-green-200">One-line setup</Badge>
                        <Badge variant="secondary" className="justify-center bg-green-100 text-green-700 border-green-200">No dependencies</Badge>
                        <Badge variant="secondary" className="justify-center bg-green-100 text-green-700 border-green-200">Customizable</Badge>
                        <Badge variant="secondary" className="justify-center bg-green-100 text-green-700 border-green-200">GDPR compliant</Badge>
                      </div>

                      {/* Instructions */}
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-2">How to use:</h4>
                        <ol className="text-sm text-green-800 space-y-1">
                          <li>1. Replace <code className="bg-green-100 px-1 rounded">YOUR_BOT_ID</code> with your actual bot ID</li>
                          <li>2. Add this code to your website's &lt;head&gt; or before &lt;/body&gt;</li>
                          <li>3. The chat widget will appear automatically</li>
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Integration Steps */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Simple 3-Step Setup</h3>
                  {integrationSteps.map((step, index) => (
                    <Card 
                      key={index}
                      className={`border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                        visibleSections.has('demo') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                      }`}
                      style={{ transitionDelay: `${index * 200}ms` }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {step.icon}
                              <h4 className="font-semibold text-gray-900">{step.title}</h4>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="customization" className="mt-12">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Customization Preview */}
                <Card className="border-0 bg-gradient-to-br from-purple-50 to-violet-50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-purple-900">
                      <Palette className="w-6 h-6" />
                      <span>Customization Options</span>
                    </CardTitle>
                    <CardDescription className="text-purple-700">
                      Make the chatbot match your brand and requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white rounded-lg p-6 min-h-[400px] shadow-inner">
                      <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-violet-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Palette className="w-10 h-10 text-purple-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Customize Your Chatbot</h4>
                        <p className="text-gray-600 text-sm">
                          Choose from our extensive customization options to create the perfect chatbot for your brand
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Customization Options */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Personalization Features</h3>
                  {customizationOptions.map((option, index) => (
                    <Card 
                      key={index}
                      className={`border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                        visibleSections.has('demo') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                      }`}
                      style={{ transitionDelay: `${index * 200}ms` }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-violet-200 rounded-full flex items-center justify-center flex-shrink-0">
                            {option.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">{option.title}</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">{option.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to provide exceptional customer support
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {demoFeatures.map((feature, index) => (
              <Card 
                key={index}
                className={`group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm ${
                  visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Customer Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join hundreds of companies using QueryWing to provide instant, intelligent support.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button 
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Start your free trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button 
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6"
              >
                View Dashboard
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
