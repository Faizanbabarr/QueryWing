"use client"

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  Users,
  Building,
  Globe,
  Headphones,
  Bot,
  Zap,
  Shield,
  Star
} from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    company: '', 
    message: '',
    contactMethod: 'email'
  })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
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

  const contactMethods = [
    {
      id: 'email',
      title: 'Email Support',
      description: 'Get a response within 24 hours',
      icon: <Mail className="w-6 h-6" />,
      value: 'hello@querywing.com',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'phone',
      title: 'Phone Support',
      description: 'Speak with our team directly',
      icon: <Phone className="w-6 h-6" />,
      value: '+1 (555) 123-4567',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'live-chat',
      title: 'Live Chat',
      description: 'Chat with us in real-time',
      icon: <MessageCircle className="w-6 h-6" />,
      value: 'Available 24/7',
      color: 'from-purple-500 to-purple-600'
    }
  ]

  const officeLocations = [
    {
      city: 'San Francisco',
      country: 'United States',
      address: '123 Innovation Drive, Tech City, CA 94105',
      timezone: 'PST (UTC-8)',
      hours: '9:00 AM - 6:00 PM'
    },
    {
      city: 'London',
      country: 'United Kingdom',
      address: '456 Business Street, London, EC1A 1BB',
      timezone: 'GMT (UTC+0)',
      hours: '9:00 AM - 6:00 PM'
    },
    {
      city: 'Singapore',
      country: 'Singapore',
      address: '789 Tech Hub, Singapore 018956',
      timezone: 'SGT (UTC+8)',
      hours: '9:00 AM - 6:00 PM'
    }
  ]

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      // create a pseudo conversation id for contact
      const conversationId = `contact_${Date.now()}`
      await fetch('/api/v1/lead', { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify({
          conversationId,
          name: form.name || 'Website Visitor',
          email: form.email,
          phone: form.phone,
          company: form.company
        }) 
      })
      setSent(true)
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header showAuth={true} showDashboardNav={false} />
      
      {/* Hero Section */}
      <section id="hero" className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-6 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 transition-colors">
              <Sparkles className="w-4 h-4 mr-2" />
              Get In Touch
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              Let's Start a
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Conversation
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Have questions about QueryWing? Our team is here to help you get started 
              and make the most of our AI-powered chatbot platform.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section id="contact-methods" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Multiple Ways to Connect
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the contact method that works best for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {contactMethods.map((method, index) => (
              <Card 
                key={method.id}
                className={`group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-gray-50/30 ${
                  visibleSections.has('contact-methods') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${method.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform duration-300`}>
                    {method.icon}
                  </div>
                  <CardTitle className="text-xl text-gray-900">{method.title}</CardTitle>
                  <CardDescription className="text-gray-600">{method.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-lg font-semibold text-gray-800 mb-4">{method.value}</p>
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                  >
                    {method.id === 'email' ? 'Send Email' : 
                     method.id === 'phone' ? 'Call Now' : 'Start Chat'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Send Us a Message
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Tell us about your needs and we'll get back to you with a personalized solution
              </p>
            </div>

            {sent ? (
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Message Sent Successfully!</h3>
                  <p className="text-lg text-gray-600 mb-6">
                    Thank you for reaching out. We've received your message and will get back to you within 24 hours.
                  </p>
                  <Button 
                    onClick={() => setSent(false)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    Send Another Message
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h3>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Email</h4>
                        <p className="text-gray-600">hello@querywing.com</p>
                        <p className="text-sm text-gray-500">Response within 24 hours</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Phone</h4>
                        <p className="text-gray-600">+1 (555) 123-4567</p>
                        <p className="text-sm text-gray-500">Mon-Fri, 9AM-6PM PST</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Office</h4>
                        <p className="text-gray-600">123 Innovation Drive, Tech City, CA 94105</p>
                        <p className="text-sm text-gray-500">San Francisco, CA</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                  <CardContent className="p-8">
                    <form onSubmit={submit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                          <Input 
                            placeholder="Your full name" 
                            value={form.name} 
                            onChange={e => setForm({...form, name: e.target.value})}
                            required
                            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                          <Input 
                            placeholder="Your company" 
                            value={form.company} 
                            onChange={e => setForm({...form, company: e.target.value})}
                            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                          <Input 
                            placeholder="your@email.com" 
                            type="email" 
                            required 
                            value={form.email} 
                            onChange={e => setForm({...form, email: e.target.value})}
                            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <Input 
                            placeholder="Your phone number" 
                            value={form.phone} 
                            onChange={e => setForm({...form, phone: e.target.value})}
                            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                        <Textarea 
                          placeholder="Tell us about your needs and how we can help..." 
                          value={form.message} 
                          onChange={e => setForm({...form, message: e.target.value})}
                          required
                          rows={4}
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </div>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section id="offices" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Global Presence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We have offices around the world to serve you better
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {officeLocations.map((office, index) => (
              <Card 
                key={office.city}
                className={`group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-gray-50 to-blue-50/30 ${
                  visibleSections.has('offices') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">{office.city}</CardTitle>
                  <CardDescription className="text-gray-600">{office.country}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-600">{office.address}</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">{office.hours}</p>
                      <p className="text-xs text-gray-500">{office.timezone}</p>
                    </div>
                  </div>
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
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of businesses using QueryWing to transform their customer support
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6"
            >
              Schedule Demo
            </Button>
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


