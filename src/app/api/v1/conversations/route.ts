import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { botId, visitorId } = body

    if (!botId || !visitorId) {
      return NextResponse.json(
        { error: 'Missing required fields: botId and visitorId' },
        { status: 400 }
      )
    }

    // Verify bot exists
    const bot = await db.bot.findUnique({
      where: { id: botId }
    })

    if (!bot) {
      return NextResponse.json(
        { error: 'Bot not found' },
        { status: 404 }
      )
    }

    // Create conversation
    const conversation = await db.conversation.create({
      data: {
        botId,
        visitorId,
        status: 'active'
      },
      include: {
        bot: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    })

    return NextResponse.json({ 
      conversation: {
        id: conversation.id,
        botId: conversation.botId,
        visitorId: conversation.visitorId,
        status: conversation.status,
        createdAt: conversation.createdAt,
        bot: conversation.bot
      }
    })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const botId = searchParams.get('botId')
    const visitorId = searchParams.get('visitorId')
    const status = searchParams.get('status')

    if (!botId || !visitorId) {
      return NextResponse.json(
        { error: 'Missing required parameters: botId and visitorId' },
        { status: 400 }
      )
    }

    const conversations = await db.conversation.findMany({
      where: {
        botId,
        visitorId,
        ...(status && { status })
      },
      include: {
        bot: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}
