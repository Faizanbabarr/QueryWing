import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationId, botId, visitorId } = body

    if (!message || !botId) {
      return NextResponse.json(
        { error: 'Missing required fields: message and botId' },
        { status: 400 }
      )
    }

    // Verify bot exists and is active
    const bot = await db.bot.findUnique({
      where: { id: botId }
    })

    if (!bot) {
      return NextResponse.json(
        { error: 'Bot not found or has been deleted' },
        { status: 404 }
      )
    }

    if (bot.status !== 'active') {
      return NextResponse.json(
        { error: 'Bot is currently inactive' },
        { status: 400 }
      )
    }

    // Check if tenant has enough bot credits
    const tenant = await db.tenant.findUnique({
      where: { id: bot.tenantId },
      select: { botCredits: true, plan: true }
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // For starter plan, check credits; for growth/scale, allow unlimited
    if (tenant.plan === 'starter' && tenant.botCredits <= 0) {
      return NextResponse.json(
        { error: 'No bot credits remaining. Please upgrade your plan or purchase more credits.' },
        { status: 402 }
      )
    }

    let conversation
    let isNewConversation = false

    if (conversationId) {
      // Use existing conversation
      conversation = await db.conversation.findUnique({
        where: { id: conversationId }
      })

      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        )
      }
    } else {
      // Create new conversation
      conversation = await db.conversation.create({
        data: {
          botId,
          visitorId: visitorId || `visitor_${Date.now()}`,
          status: 'active'
        }
      })
      isNewConversation = true
    }

    // Save user message
    const userMessage = await db.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message
      }
    })

    // Generate bot response using OpenAI with bot settings
    const botResponse = await generateBotResponse({
      userMessage: message,
      botInstructions: bot.instructions,
      conversationId: conversation.id,
      temperature: (bot as any).settings?.temperature ?? bot.temperature ?? 0.7,
      maxTokens: (bot as any).settings?.maxTokens ?? 500,
      topP: bot.topP ?? 0.9
    })

    // Save bot response
    const botMessage = await db.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: botResponse
      }
    })

    // Track bot credit usage
    try {
      const estimatedTokens = Math.ceil(botResponse.length / 4) // Rough estimate: 1 token ≈ 4 characters
      const costPerToken = 0.000002 // OpenAI GPT-3.5-turbo cost per token
      const cost = estimatedTokens * costPerToken

      await db.botCreditUsage.create({
        data: {
          tenantId: bot.tenantId,
          botId: bot.id,
          messageId: botMessage.id,
          tokensUsed: estimatedTokens,
          cost: cost
        }
      })

      // Deduct credits from tenant
      await db.tenant.update({
        where: { id: bot.tenantId },
        data: {
          botCredits: {
            decrement: estimatedTokens
          }
        }
      })
    } catch (creditError) {
      console.error('Error tracking bot credit usage:', creditError)
      // Continue with the response even if credit tracking fails
    }

    // Track analytics
    await db.analytics.create({
      data: {
        tenantId: bot.tenantId,
        type: 'message_sent',
        visitorId: conversation.visitorId,
        botId: bot.id,
        metadata: {
          messageLength: message.length,
          conversationId: conversation.id
        }
      }
    })

    // Check if we should create a lead (after certain number of messages)
    const messageCount = await db.message.count({
      where: { conversationId: conversation.id }
    })

    // Check if there's already a lead for this conversation
    const existingLead = await db.lead.findFirst({
      where: { conversationId: conversation.id }
    })

    if (messageCount >= 3 && !existingLead) {
      // Extract potential lead information from messages
      const leadInfo = await extractLeadInfo(conversation.id)
      
      if (leadInfo.email) {
        const createdLead = await db.lead.create({
          data: {
            tenantId: bot.tenantId,
            conversationId: conversation.id,
            name: leadInfo.name,
            email: leadInfo.email,
            phone: leadInfo.phone,
            company: leadInfo.company,
            source: 'chat',
            botId: bot.id,
            status: 'new'
          }
        })

        // Track lead capture analytics
        await db.analytics.create({
          data: {
            tenantId: bot.tenantId,
            type: 'lead_captured',
            visitorId: conversation.visitorId,
            botId: bot.id,
            metadata: {
              conversationId: conversation.id,
              leadSource: 'chat'
            }
          }
        })

        // Email notifications based on user preferences
        try {
          const { notifyLeadCreated } = await import('@/lib/notifications')
          await notifyLeadCreated({ tenantId: bot.tenantId, lead: createdLead })
        } catch (e) {
          console.log('[notify] auto-lead email skipped:', e)
        }
      }
    }

    // Check if user wants live agent handoff
    const lowerMessage = message.toLowerCase()
    const wantsLiveAgent = lowerMessage.includes('live agent') || 
                          lowerMessage.includes('human') || 
                          lowerMessage.includes('speak to someone') ||
                          lowerMessage.includes('connect me') ||
                          lowerMessage.includes('transfer')

    let finalResponse = botResponse;

    if (wantsLiveAgent) {
      // Create live agent request
      try {
        await db.liveChatRequest.create({
          data: {
            tenantId: bot.tenantId,
            conversationId: conversation.id,
            visitorId: conversation.visitorId,
            botId: bot.id,
            status: 'pending',
            requestType: 'chat_handoff',
            priority: 'normal'
          }
        })

        // Track live agent request
        await db.analytics.create({
          data: {
            tenantId: bot.tenantId,
            type: 'live_agent_requested',
            visitorId: conversation.visitorId,
            botId: bot.id,
            metadata: {
              conversationId: conversation.id,
              requestType: 'chat_handoff'
            }
          }
        })

        // Email notifications based on user preferences
        try {
          const { notifyLiveAgentRequested } = await import('@/lib/notifications')
          await notifyLiveAgentRequested({ tenantId: bot.tenantId, conversationId: conversation.id })
        } catch (e) {
          console.log('[notify] live-agent email skipped:', e)
        }

        // Add live agent notification to response
        finalResponse += "\n\n🔄 **Live Agent Requested**: I've requested a live agent to assist you. They will join this conversation shortly. Please wait while I connect you."
      } catch (error) {
        console.error('Error creating live agent request:', error)
      }
    }

    return NextResponse.json({
      response: finalResponse,
      conversationId: conversation.id,
      isNewConversation,
      messageId: botMessage.id,
      liveAgentRequested: wantsLiveAgent
    })

  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}

async function generateBotResponse(params: {
  userMessage: string
  botInstructions: string
  conversationId: string
  temperature?: number
  maxTokens?: number
  topP?: number
}): Promise<string> {
  try {
    const { userMessage, botInstructions, conversationId, temperature = 0.7, maxTokens = 500, topP = 0.9 } = params
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Get conversation history for context
    const conversation = await db.conversation.findFirst({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: 'asc' } } }
    })

    // Build conversation history for context
    const conversationHistory = conversation?.messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    })) || []

    // Create the system message with bot instructions
    const systemMessage = {
      role: 'system' as const,
      content: `You are a helpful AI assistant. ${botInstructions || 'Help users with their questions and provide accurate, helpful information. Be conversational, helpful, and professional. If a user asks about pricing, demos, or wants to speak to someone, offer to connect them with a live agent.'}`
    }

    // Prepare messages for OpenAI
    const messages = [
      systemMessage,
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user' as const, content: userMessage }
    ]

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: Math.max(50, Math.min(2048, Math.floor(maxTokens))),
      temperature: Math.max(0, Math.min(2, temperature)),
      top_p: Math.max(0, Math.min(1, topP)),
    })

    const botResponse = completion.choices[0]?.message?.content || 'I apologize, but I encountered an error. Please try again.'

    return botResponse

  } catch (error) {
    console.error('Error calling OpenAI:', error)
    
    // Enhanced fallback responses if OpenAI fails
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm here to help you. How can I assist you today?"
    }
    
    if (lowerMessage.includes('help')) {
      return "I'd be happy to help! What specific question do you have or what can I assist you with?"
    }
    
    if (lowerMessage.includes('pricing') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      return "Our pricing varies based on your needs. We offer different plans starting from $29/month. Would you like me to connect you with a live agent who can provide detailed pricing information?"
    }
    
    if (lowerMessage.includes('demo') || lowerMessage.includes('trial')) {
      return "I'd be happy to set up a demo for you! Let me connect you with a live agent who can schedule a personalized demonstration of our platform."
    }
    
    if (lowerMessage.includes('contact') || lowerMessage.includes('speak') || lowerMessage.includes('agent') || lowerMessage.includes('human')) {
      return "I'd be happy to connect you with a live agent who can provide more personalized assistance. Would you like me to do that now?"
    }
    
    if (lowerMessage.includes('plan') || lowerMessage.includes('subscription')) {
      return "We offer several plans to meet different needs. Our starter plan is $29/month, growth plan is $99/month, and scale plan is $299/month. Would you like me to connect you with someone who can explain the features of each plan?"
    }
    
    return "Thank you for your message. I'm here to help answer your questions and provide assistance. Is there something specific you'd like to know more about?"
  }
}

async function extractLeadInfo(conversationId: string): Promise<{
  name?: string
  email?: string
  phone?: string
  company?: string
}> {
  try {
    const messages = await db.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    })

    const leadInfo: any = {}

    // Simple extraction logic - in production, use more sophisticated NLP
    for (const message of messages) {
      if (message.role === 'user') {
        const content = message.content.toLowerCase()
        
        // Extract email
        const emailMatch = content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
        if (emailMatch && !leadInfo.email) {
          leadInfo.email = emailMatch[0]
        }
        
        // Extract phone (simple pattern)
        const phoneMatch = content.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
        if (phoneMatch && !leadInfo.phone) {
          leadInfo.phone = phoneMatch[0]
        }
        
        // Extract company names (simple heuristic)
        if (content.includes('company') || content.includes('work at') || content.includes('from')) {
          const words = content.split(' ')
          const companyIndex = words.findIndex(word => 
            word === 'company' || word === 'work' || word === 'from'
          )
          if (companyIndex !== -1 && words[companyIndex + 1]) {
            leadInfo.company = words[companyIndex + 1].replace(/[^\w]/g, '')
          }
        }
      }
    }

    return leadInfo
  } catch (error) {
    console.error('Error extracting lead info:', error)
    return {}
  }
}
