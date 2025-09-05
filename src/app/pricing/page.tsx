"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import Header from '@/components/Header'
import { PLAN_CONFIGS } from '@/lib/plan-config'
import { 
  CheckCircle, 
  XCircle, 
  Star, 
  Zap, 
  Users, 
  MessageCircle, 
  Headphones, 
  BarChart3, 
  Shield, 
  Globe, 
  Code, 
  ArrowRight, 
  Sparkles,
  TrendingUp,
  Crown,
  Rocket,
  Target,
  Award,
  Clock,
  Lock,
  HelpCircle
} from 'lucide-react'

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState('starter')
  const [isAnnual, setIsAnnual] = useState(false)
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

  const plans = [
    {
      id: 'starter',
      name: PLAN_CONFIGS.starter.name,
      price: PLAN_CONFIGS.starter.price,
      description: 'Perfect for small businesses getting started',
      features: PLAN_CONFIGS.starter.features,
      limitations: PLAN_CONFIGS.starter.limitations,
      popular: false,
      icon: <Rocket className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'growth',
      name: PLAN_CONFIGS.growth.name,
      price: PLAN_CONFIGS.growth.price.replace('/month', ''),
      period: '/month',
      description: 'Ideal for growing businesses with multiple needs',
      features: PLAN_CONFIGS.growth.features,
      limitations: PLAN_CONFIGS.growth.limitations,
      popular: true,
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'scale',
      name: PLAN_CONFIGS.scale.name,
      price: PLAN_CONFIGS.scale.price.replace('/month', ''),
      period: '/month',
      description: 'For enterprise teams with unlimited needs',
      features: PLAN_CONFIGS.scale.features,
      limitations: PLAN_CONFIGS.scale.limitations,
      popular: false,
      icon: <Crown className="w-8 h-8" />,
      color: 'from-indigo-500 to-indigo-600'
    }
  ]

  const addOns = [
    {
      name: 'Additional Bot Credits',
      description: 'Extra message credits for your chatbots',
      price: '$0.15',
      unit: 'per message',
      icon: <MessageCircle className="w-6 h-6" />,
      features: [
        'Flexible credit system',
        'Pay only for what you use',
        'No monthly commitment',
        'Instant activation'
      ]
    },
    {
      name: 'Additional Bots',
      description: 'Add more chatbots to your workspace',
      price: '$19',
      unit: 'per bot/month',
      icon: <Users className="w-6 h-6" />,
      features: [
        'Fully independent bots',
        'Custom instructions per bot',
        'Separate analytics',
        'Easy management'
      ]
    },
    {
      name: 'Live Agents',
      description: 'Human support for complex queries',
      price: '$40',
      unit: 'per agent/month',
      icon: <Headphones className="w-6 h-6" />,
      features: [
        'Professional human agents',
        'Real-time chat support',
        'Agent performance tracking',
        'Customizable workflows'
      ]
    }
  ]

  const faqs = [
    {
      question: 'Can I change plans anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately with no downtime.'
    },
    {
      question: 'What happens if I exceed my plan limits?',
      answer: 'For the Starter plan, you\'ll need to purchase additional credits. Growth and Scale plans include generous limits that cover most use cases.'
    },
    {
      question: 'How do live agents work?',
      answer: 'Live agents are human support staff who can take over from the AI chatbot for complex queries. They\'re available during business hours and can be customized to your needs.'
    },
    {
      question: 'Is there a setup fee?',
      answer: 'No setup fees! All plans include instant setup and access to our platform. You can start using QueryWing immediately after signup.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied with our service, we\'ll refund your payment in full.'
    },
    {
      question: 'Can I cancel my subscription?',
      answer: 'Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees.'
    }
  ]

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan)
  }

  const handleUpgrade = (plan: string) => {
    if (plan === 'starter') {
      // For starter plan, redirect to dashboard (free plan starts immediately)
      window.location.href = '/dashboard'
    } else {
      // For paid plans, redirect to checkout
      window.location.href = `/checkout?plan=${plan.toLowerCase()}`
    }
  }

  const getAnnualDiscount = (monthlyPrice: string) => {
    const price = parseFloat(monthlyPrice.replace('$', ''))
    const annualPrice = price * 12 * 0.8 // 20% discount
    return `$${annualPrice.toFixed(0)}`
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
              Pricing Plans
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              Simple, Transparent
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Pricing
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Choose the plan that fits your business needs. All plans include our core features 
              with no hidden fees or setup costs.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`text-lg ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-blue-600"
              />
              <span className={`text-lg ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                Annual
                <Badge className="ml-2 bg-green-100 text-green-700 border-green-200">
                  Save 20%
                </Badge>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Plans */}
      <section id="plans" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={plan.id}
                className={`relative transition-all duration-500 transform hover:-translate-y-2 ${
                  plan.popular 
                    ? 'ring-2 ring-purple-500 shadow-xl scale-105' 
                    : 'hover:shadow-lg'
                } border-0 bg-gradient-to-br from-white to-gray-50/30 ${
                  visibleSections.has('plans') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pt-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl text-gray-900 mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {isAnnual && plan.id !== 'starter' ? getAnnualDiscount(plan.price) : plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-gray-600">
                        {isAnnual ? '/year' : plan.period}
                      </span>
                    )}
                    {isAnnual && plan.id !== 'starter' && (
                      <div className="text-sm text-green-600 mt-1">
                        Save ${(parseFloat(plan.price.replace('$', '')) * 12 * 0.2).toFixed(0)}/year
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {plan.limitations.length > 0 && (
                    <div className="space-y-2 mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm font-medium text-yellow-800">Limitations:</p>
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-center text-sm text-yellow-700">
                          <XCircle className="w-4 h-4 mr-3 flex-shrink-0" />
                          {limitation}
                        </div>
                      ))}
                    </div>
                  )}

                  <Button 
                    onClick={() => handleUpgrade(plan.id)}
                    className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white py-3 rounded-lg transition-all duration-300 transform hover:-translate-y-1`}
                  >
                    {plan.name === 'Starter' ? 'Start Free Plan' : `Get ${plan.name} Plan`}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section id="addons" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Flexible Add-ons
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Need more? Purchase additional features as you grow without changing your base plan
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {addOns.map((addon, index) => (
              <Card 
                key={addon.name} 
                className={`hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm ${
                  visibleSections.has('addons') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    {addon.icon}
                  </div>
                  <CardTitle className="text-xl text-gray-900">{addon.name}</CardTitle>
                  <CardDescription className="text-gray-600">{addon.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-purple-600">{addon.price}</span>
                    <span className="text-gray-600">{addon.unit}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-6">
                    {addon.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-purple-500 text-purple-600 hover:bg-purple-50 transition-all duration-300"
                  >
                    Contact Sales
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to know about our pricing and plans
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid gap-6">
            {faqs.map((faq, index) => (
              <Card 
                key={index}
                className={`border-0 bg-gray-50/50 hover:bg-gray-50 transition-all duration-300 ${
                  visibleSections.has('faq') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <HelpCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
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
            Join thousands of businesses using QueryWing to improve customer support and generate more leads
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              onClick={() => handleUpgrade('starter')}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Start Free Plan
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              onClick={() => handleUpgrade('growth')}
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6"
            >
              Get Growth Plan
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
