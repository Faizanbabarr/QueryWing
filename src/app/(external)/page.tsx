import Link from 'next/link'
import StartFreeButton from '@/components/StartFreeButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, MessageCircle, Users, Zap, Shield, BarChart3, Bot } from 'lucide-react'
import ChatWidget from '@/components/ChatWidget'
import Header from '@/components/Header'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <Header showAuth={true} showDashboardNav={false} />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            🚀 AI-Powered Website Assistant
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
            Your Website's
            <span className="text-primary"> AI Assistant</span>
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Answer questions from your content, capture leads, and hand off to your team. 
            All powered by AI that knows your business inside and out.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <StartFreeButton size="lg" className="btn-primary text-lg px-8 py-3">
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </StartFreeButton>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                See it on your site
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Everything you need to automate customer support
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              From answering questions to capturing leads, our AI assistant handles it all.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Smart Answers</CardTitle>
                <CardDescription>
                  AI that understands your content and provides accurate, helpful responses to customer questions.
                </CardDescription>
                <div className="mt-4">
                  <Link href="/dashboard/content">
                    <Button variant="outline" size="sm">Go to Content</Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Lead Capture</CardTitle>
                <CardDescription>
                  Automatically identify and capture qualified leads from conversations with smart lead scoring.
                </CardDescription>
                <div className="mt-4">
                  <Link href="/dashboard/bots">
                    <Button variant="outline" size="sm">Create a Bot</Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Instant Setup</CardTitle>
                <CardDescription>
                  Get up and running in minutes. Just upload your content and embed the widget on your site.
                </CardDescription>
                <div className="mt-4">
                  <Link href="/demo">
                    <Button variant="outline" size="sm">Try the Demo</Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-neutral-600">
              Three simple steps to transform your customer support
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Upload Your Content</h3>
              <p className="text-neutral-600 mb-3">
                Add your website, documents, FAQs, and knowledge base. Our AI learns everything about your business.
              </p>
              <Link href="/dashboard/content"><Button variant="outline" size="sm">Upload Content</Button></Link>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Embed the Widget</h3>
              <p className="text-neutral-600 mb-3">
                Add a single line of code to your website. The chat widget appears instantly and starts helping visitors.
              </p>
              <Link href="/dashboard/bots"><Button variant="outline" size="sm">Get Embed</Button></Link>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Watch it Work</h3>
              <p className="text-neutral-600 mb-3">
                Your AI assistant answers questions, captures leads, and provides 24/7 support automatically.
              </p>
              <Link href="/demo"><Button variant="outline" size="sm">Watch Demo</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-neutral-600">Questions Answered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-neutral-600">Leads Captured</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-neutral-600">Support Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-neutral-600">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to transform your customer support?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using AI to provide better customer service and capture more leads.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <StartFreeButton size="lg" variant="secondary" className="text-lg px-8 py-3">
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </StartFreeButton>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent border-white text-white hover:bg-white hover:text-primary">
                See Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-neutral-900">QueryWing</span>
              </div>
              <p className="text-neutral-600">
                AI website assistant that answers from your content, captures leads, and hands off to your team.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-neutral-600">
                <li><Link href="#features" className="hover:text-neutral-900">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-neutral-900">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-neutral-900">Documentation</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-neutral-600">
                <li><Link href="/about" className="hover:text-neutral-900">About</Link></li>
                <li><Link href="/blog" className="hover:text-neutral-900">Blog</Link></li>
                <li><Link href="/status" className="hover:text-neutral-900">Status</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-neutral-600">
                <li><Link href="/help" className="hover:text-neutral-900">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-neutral-900">Contact</Link></li>
                <li><Link href="/demo" className="hover:text-neutral-900">Demo</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-neutral-600">
            <p>&copy; 2024 QueryWing. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Chat Widget - pass no default demo id; require explicit id if used here */}
      <ChatWidget />
    </div>
  )
}
