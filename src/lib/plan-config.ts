// Plan Configuration
// This file defines the limits and features for each subscription plan

export interface PlanConfig {
  name: string
  price: string
  maxBots: number
  maxLiveAgents: number
  botCredits: number
  maxLeads: number
  features: string[]
  limitations: string[]
}

export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  starter: {
    name: 'Starter',
    price: 'Free',
    maxBots: 1,
    maxLiveAgents: 1,
    botCredits: 200, // 200 messages per month
    maxLeads: 50,
    features: [
      '1 AI Chatbot',
      '200 messages per month',
      '50 leads per month',
      '1 Live Agent (up to 30 queries)',
      'Basic analytics',
      'Email support',
      'Lead capture',
      'Basic reporting'
    ],
    limitations: [
      'Limited to 1 bot',
      'Limited to 30 live queries per month',
      'Basic features only',
      'No API access'
    ]
  },
  growth: {
    name: 'Growth',
    price: '$99/month',
    maxBots: 5,
    maxLiveAgents: 3,
    botCredits: 5000, // 5,000 messages per month
    maxLeads: 1000,
    features: [
      'Up to 5 AI Chatbots',
      '5,000 messages per month',
      '1,000 leads per month',
      '3 Live Agents (up to 100 queries)',
      'Advanced analytics',
      'Priority support',
      'Custom bot instructions',
      'Lead scoring & tags',
      'Email notifications',
      'API access'
    ],
    limitations: [
      'Limited to 5 bots',
      'Limited to 3 live agents',
      'Limited to 100 live queries per month'
    ]
  },
  scale: {
    name: 'Scale',
    price: '$299/month',
    maxBots: 50,
    maxLiveAgents: -1, // Unlimited
    botCredits: -1, // Unlimited
    maxLeads: -1, // Unlimited
    features: [
      'Up to 50 AI Chatbots',
      'Unlimited messages',
      'Unlimited leads',
      'Unlimited live agents',
      'Advanced lead scoring',
      'Custom workflows',
      'SLA guarantee',
      'SSO integration',
      'Dedicated support',
      'Custom integrations',
      'White-label options',
      'Advanced analytics',
      'Multi-tenant support',
      'Priority queue'
    ],
    limitations: []
  }
}

export function getPlanConfig(planName: string): PlanConfig {
  return PLAN_CONFIGS[planName] || PLAN_CONFIGS.starter
}

export function getPlanLimits(planName: string) {
  const config = getPlanConfig(planName)
  return {
    maxBots: config.maxBots,
    maxLiveAgents: config.maxLiveAgents,
    botCredits: config.botCredits,
    maxLeads: config.maxLeads
  }
}
