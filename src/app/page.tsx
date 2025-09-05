"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  MessageCircle, 
  Users, 
  Zap, 
  Shield, 
  BarChart3, 
  Bot, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Play,
  Globe,
  Smartphone,
  Headphones,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  Award,
  Clock,
  Lock,
  Twitter,
  Linkedin,
  Github,
  Phone,
  Building
} from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Force animation to trigger on every load/reload
    setIsVisible(false)
    
    // Small delay to ensure the component is fully rendered
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    
    // Auto-rotate features
    const featureInterval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3)
    }, 4000)
    
    // Auto-rotate testimonials
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3)
    }, 5000)
    
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
    
    return () => {
      clearTimeout(timer)
      clearInterval(featureInterval)
      clearInterval(testimonialInterval)
      observer.disconnect()
    }
  }, [])

  const features = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: "AI-Powered Chatbots",
      description: "Intelligent chatbots that learn from your content and provide instant, accurate responses to customer queries."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Lead Generation",
      description: "Automatically capture leads and customer information through intelligent conversations and forms."
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "Live Agent Handoff",
      description: "Seamlessly transfer complex conversations to your human team for personalized support."
    }
  ]

  const stats = [
    { number: "24/7", label: "Availability" },
    { number: "95%", label: "Customer Satisfaction" },
    { number: "3x", label: "Faster Response" },
    { number: "40%", label: "Cost Reduction" }
  ]

  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for small businesses",
      features: ["1 AI Bot", "200 Messages/month", "1 Live Agent", "Basic Analytics", "Email Support"],
      popular: false
    },
    {
      name: "Growth",
      price: "$29",
      period: "/month",
      description: "Ideal for growing companies",
      features: ["3 AI Bots", "1000 Messages/month", "3 Live Agents", "Advanced Analytics", "Priority Support", "Custom Branding"],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: ["Unlimited Bots", "Unlimited Messages", "Unlimited Agents", "Custom Integrations", "Dedicated Support", "White-label Solution"],
      popular: false
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechStart Inc.",
      content: "QueryWing transformed our customer support. We're handling 3x more inquiries with 95% customer satisfaction. The AI bot is incredibly intelligent!",
      avatar: "SJ",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Marketing Director, GrowthCo",
      content: "The lead generation capabilities are amazing. We've seen a 40% increase in qualified leads since implementing QueryWing. Highly recommended!",
      avatar: "MC",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Customer Success Manager, ServicePro",
      content: "The live agent handoff feature is seamless. Our team can focus on complex cases while the AI handles routine queries. Game changer!",
      avatar: "ER",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  QueryWing
                </span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</Link>
              <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link>
              <Link href="/demo" className="text-gray-600 hover:text-blue-600 transition-colors">Demo</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/sign-in">
                <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          {/* Badge with animation */}
          <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-6 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 transition-colors">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Customer Support
            </Badge>
          </div>
          
          {/* Main heading with animation */}
          <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              Transform Your
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Customer Experience
              </span>
            </h1>
          </div>
          
          {/* Description with animation */}
          <div className={`transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Deploy intelligent AI chatbots that learn from your content, capture leads automatically, 
              and seamlessly hand off to your human team. Boost customer satisfaction while reducing support costs.
            </p>
          </div>
          
          {/* Buttons with animation */}
          <div className={`transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300">
                  <Play className="w-4 h-4 mr-2" />
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="relative mt-20">
            <div className={`absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-20 transition-all duration-1000 delay-1000 ${isVisible ? 'animate-float' : 'opacity-0 scale-50'}`}></div>
            <div className={`absolute -top-5 -right-10 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 transition-all duration-1000 delay-1200 ${isVisible ? 'animate-float' : 'opacity-0 scale-50'}`} style={{ animationDelay: '1s' }}></div>
            <div className={`absolute top-20 left-20 w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-20 transition-all duration-1000 delay-1400 ${isVisible ? 'animate-float' : 'opacity-0 scale-50'}`} style={{ animationDelay: '2s' }}></div>
            
            {/* Main Hero Image/Illustration */}
            <div className={`relative z-10 bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border border-gray-100 transition-all duration-1000 delay-1600 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Bot className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI Bot</h3>
                  <p className="text-sm text-gray-600">Intelligent responses</p>
                </div>
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Lead Capture</h3>
                  <p className="text-sm text-gray-600">Automatic collection</p>
                </div>
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Headphones className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Live Agent</h3>
                  <p className="text-sm text-gray-600">Human handoff</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`text-center transition-all duration-700 delay-${index * 100} ${visibleSections.has('stats') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              >
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose QueryWing?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI technology with intuitive design to deliver 
              exceptional customer experiences that drive business growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className={`group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm ${
                  currentFeature === index ? 'ring-2 ring-blue-500 shadow-lg' : ''
                } ${visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
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

          {/* Additional Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Globe className="w-6 h-6" />, title: "Multi-language Support", description: "Reach global customers" },
              { icon: <Smartphone className="w-6 h-6" />, title: "Mobile Optimized", description: "Works on all devices" },
              { icon: <Shield className="w-6 h-6" />, title: "Enterprise Security", description: "SOC 2 compliant" },
              { icon: <BarChart3 className="w-6 h-6" />, title: "Advanced Analytics", description: "Deep insights" }
            ].map((feature, index) => (
              <div 
                key={index}
                className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started with QueryWing in just three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect Your Content",
                description: "Upload your website content, documents, or connect your knowledge base to train your AI bot.",
                icon: <Target className="w-8 h-8" />
              },
              {
                step: "02",
                title: "Deploy Your Bot",
                description: "Customize your bot's appearance and deploy it on your website with a simple code snippet.",
                icon: <Rocket className="w-8 h-8" />
              },
              {
                step: "03",
                title: "Monitor & Optimize",
                description: "Track performance, analyze conversations, and continuously improve your bot's responses.",
                icon: <TrendingUp className="w-8 h-8" />
              }
            ].map((step, index) => (
              <div 
                key={index} 
                className={`text-center relative transition-all duration-700 ${
                  visibleSections.has('how-it-works') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 300}ms` }}
              >
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  {step.step}
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transform translate-x-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied customers who have transformed their business with QueryWing
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 ${
                    index === currentTestimonial
                      ? 'opacity-100 translate-x-0'
                      : index < currentTestimonial
                      ? 'opacity-0 -translate-x-full'
                      : 'opacity-0 translate-x-full'
                  }`}
                >
                  <Card className="text-center border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                    <CardContent className="p-12">
                      <div className="flex justify-center mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <blockquote className="text-xl text-gray-700 mb-8 italic leading-relaxed">
                        "{testimonial.content}"
                      </blockquote>
                      <div className="flex items-center justify-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {testimonial.avatar}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">{testimonial.name}</div>
                          <div className="text-gray-600">{testimonial.role}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Testimonial Navigation Dots */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? 'bg-blue-600 scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your business needs. All plans include our core features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index}
                className={`relative transition-all duration-500 transform hover:-translate-y-2 ${
                  plan.popular 
                    ? 'ring-2 ring-blue-500 shadow-xl scale-105' 
                    : 'hover:shadow-lg'
                } border-0 bg-white/80 backdrop-blur-sm ${
                  visibleSections.has('pricing') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-2xl text-gray-900 mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-blue-600">{plan.price}</span>
                    {plan.period && <span className="text-gray-600">{plan.period}</span>}
                  </div>
                  <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href={plan.name === "Starter" ? "/auth/sign-up" : "/pricing"}>
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white' 
                          : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {plan.name === "Starter" ? "Get Started Free" : "Choose Plan"}
                    </Button>
                  </Link>
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
            Join thousands of businesses that trust QueryWing to deliver exceptional customer support 
            and drive growth through intelligent automation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6">
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Get In Touch
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Have questions about QueryWing? Our team is here to help you get started 
                and make the most of our platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Email</div>
                      <div className="text-gray-600">hello@querywing.com</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Phone</div>
                      <div className="text-gray-600">+1 (555) 123-4567</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-violet-100 rounded-full flex items-center justify-center">
                      <Building className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Office</div>
                      <div className="text-gray-600">123 Innovation Drive, Tech City, TC 12345</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Send us a Message</h3>
                <form className="space-y-4">
                  <div>
                    <Input 
                      type="text" 
                      placeholder="Your Name" 
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <Input 
                      type="email" 
                      placeholder="Your Email" 
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <Input 
                      type="text" 
                      placeholder="Subject" 
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <textarea 
                      placeholder="Your Message" 
                      rows={4}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">QueryWing</span>
              </div>
              <p className="text-gray-400 mb-4">
                Transform your customer experience with AI-powered chatbots that learn, engage, and convert.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 QueryWing. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full w-16 h-16 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 animate-float"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowRight className="w-6 h-6 transform rotate-[-90deg]" />
        </Button>
      </div>

      {/* Background Animation Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full animate-pulse-slow"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  )
}
