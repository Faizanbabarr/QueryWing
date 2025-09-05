import { NextRequest } from 'next/server'
import OpenAI from 'openai'

// Check if OpenAI API key is available
const hasOpenAIKey = !!process.env.OPENAI_API_KEY
const openai = hasOpenAIKey ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

// Enhanced system prompt for better responses
const SYSTEM_PROMPT = `You are QueryWing, an advanced AI website assistant that helps customers with product information, support, and sales inquiries. You are knowledgeable about:

**Product Features:**
- AI-powered chat widget that understands website content
- Lead capture and CRM integration
- Human handoff capabilities
- Multi-language support
- Analytics and reporting
- GDPR compliance
- One-line installation

**Pricing:**
- Starter: Free tier with basic features
- Growth: $99/month for growing teams
- Scale: Custom pricing for enterprises

**Technical Details:**
- Built with Next.js, TypeScript, and OpenAI
- Vector search for content retrieval
- Real-time streaming responses
- Customizable widget design
- Webhook integrations

**Best Practices:**
- Be helpful, professional, and concise
- Ask clarifying questions when needed
- Provide specific, actionable answers
- Offer to connect with sales for pricing/demo requests
- Suggest relevant features based on user needs

Always maintain a friendly, professional tone and focus on helping users understand how QueryWing can solve their customer support and lead generation challenges.`

// Fallback responses when OpenAI is not available
const FALLBACK_RESPONSES = {
  greeting: "Hello! I'm QueryWing's AI assistant. I can help you with information about our features, pricing, and setup. What would you like to know?",
  pricing: "Our pricing starts with a free tier for basic features, then $99/month for growth plans, and custom enterprise pricing. What's your use case? I can help you choose the right plan.",
  features: "QueryWing offers AI-powered chat widgets, lead capture, CRM integration, human handoff, analytics, and GDPR compliance. We're designed to help businesses improve customer support and generate leads.",
  setup: "Getting started is easy! Just add one script tag to your website. I can generate your exact embed code once you have your bot ID. Would you like me to show you how?",
  support: "I'm here to help! I can answer questions about our services, help with setup, or connect you with our team. What do you need assistance with?",
  default: "Thank you for your message! I'm here to help with any questions about QueryWing. Feel free to ask about our features, pricing, or how to get started."
}

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase()
  
  if (/(hello|hi|hey|start)/.test(lower)) {
    return FALLBACK_RESPONSES.greeting
  }
  
  if (/(price|pricing|cost|plan|subscription|billing)/.test(lower)) {
    return FALLBACK_RESPONSES.pricing
  }
  
  if (/(what can you do|capabilit|featur|help)/.test(lower)) {
    return FALLBACK_RESPONSES.features
  }
  
  if (/(integrate|install|embed|wordpress|shopify|wix|squarespace|setup|get started)/.test(lower)) {
    return FALLBACK_RESPONSES.setup
  }
  
  if (/(support|help|assist)/.test(lower)) {
    return FALLBACK_RESPONSES.support
  }
  
  return FALLBACK_RESPONSES.default
}

export async function POST(req: NextRequest) {
  const { message, conversationHistory = [] } = await req.json()
  
  // Log environment status for debugging
  console.log('[demo-chat] Environment check:', {
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    openaiKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
    nodeEnv: process.env.NODE_ENV
  })
  
  // If no OpenAI API key, use fallback responses
  if (!hasOpenAIKey) {
    console.log('[demo-chat] No OpenAI API key found, using fallback responses')
    
    const fallbackResponse = getFallbackResponse(message)
    
    return new Response(JSON.stringify({ 
      content: fallbackResponse, 
      citations: [],
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      mode: 'fallback'
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }
  
  // Build conversation context
  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    ...conversationHistory.slice(-6), // Keep last 6 messages for context
    { role: 'user' as const, content: message || '' }
  ]

  try {
    const completion = await openai!.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    })
    
    const content = completion.choices[0]?.message?.content || 'I apologize, but I encountered an issue generating a response. Please try again.'
    
    // Add some demo citations for realism
    const citations = [
      {
        title: 'QueryWing Documentation',
        url: 'https://docs.querywing.com',
        snippet: 'Learn how to integrate QueryWing into your website.'
      }
    ]
    
    return new Response(JSON.stringify({ 
      content, 
      citations,
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens,
        completion_tokens: completion.usage?.completion_tokens,
        total_tokens: completion.usage?.total_tokens
      },
      mode: 'openai'
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('OpenAI API error:', error)
    
    // Fallback to intelligent responses even when OpenAI fails
    const fallbackResponse = getFallbackResponse(message)
    
    return new Response(JSON.stringify({ 
      content: fallbackResponse,
      citations: [],
      error: 'API_ERROR',
      mode: 'fallback-error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}


