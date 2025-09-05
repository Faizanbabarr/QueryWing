import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const botCount = await db.bot.count()
    const conversationCount = await db.conversation.count()
    const messageCount = await db.message.count()
    
    // Test bot retrieval
    const demoBot = await db.bot.findUnique({
      where: { id: 'demo-bot-1' }
    })

    return NextResponse.json({
      status: 'success',
      message: 'Chatbot test endpoint working',
      database: {
        connected: true,
        bots: botCount,
        conversations: conversationCount,
        messages: messageCount
      },
      demoBot: demoBot ? {
        id: demoBot.id,
        name: demoBot.name,
        status: demoBot.status,
        published: demoBot.published
      } : null,
      environment: {
        openaiKey: process.env.OPENAI_API_KEY ? 'Set' : 'Not Set',
        nodeEnv: process.env.NODE_ENV || 'development'
      }
    })
  } catch (error) {
    console.error('Chatbot test error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Chatbot test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        connected: false
      }
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, botId = 'demo-bot-1' } = body

    if (!message) {
      return NextResponse.json({
        error: 'Message is required'
      }, { status: 400 })
    }

    // Test bot retrieval
    const bot = await db.bot.findUnique({
      where: { id: botId }
    })

    if (!bot) {
      return NextResponse.json({
        error: 'Bot not found'
      }, { status: 404 })
    }

    // Test conversation creation
    const conversation = await db.conversation.create({
      data: {
        botId: bot.id,
        visitorId: `test-visitor-${Date.now()}`,
        status: 'active'
      }
    })

    // Test message creation
    const userMessage = await db.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message
      }
    })

    // Test bot response (simulated)
    const botResponse = `Test response to: "${message}". This is a test response to verify the chatbot infrastructure is working.`

    const botMessage = await db.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: botResponse
      }
    })

    return NextResponse.json({
      status: 'success',
      message: 'Test conversation created successfully',
      conversation: {
        id: conversation.id,
        botId: conversation.botId,
        visitorId: conversation.visitorId
      },
      messages: [
        {
          id: userMessage.id,
          role: userMessage.role,
          content: userMessage.content
        },
        {
          id: botMessage.id,
          role: botMessage.role,
          content: botMessage.content
        }
      ],
      bot: {
        id: bot.id,
        name: bot.name,
        instructions: bot.instructions
      }
    })

  } catch (error) {
    console.error('Chatbot test POST error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Test conversation creation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
