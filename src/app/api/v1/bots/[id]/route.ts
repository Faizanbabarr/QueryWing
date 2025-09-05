import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const bot = await db.bot.findUnique({
      where: { id },
      select: {
        id: true,
        tenantId: true,
        name: true,
        description: true,
        status: true,
        published: true,
        instructions: true,
        temperature: true,
        topP: true,
        retrievalMode: true,
        settings: true,
        publicKey: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!bot) {
      return NextResponse.json(
        { error: 'Bot not found or has been deleted' },
        { status: 404 }
      )
    }

    // Check if bot is active and published
    if (bot.status !== 'active') {
      return NextResponse.json(
        { error: 'Bot is currently inactive' },
        { status: 400 }
      )
    }

    // Allow active bots regardless of published flag (embed will work immediately)

    // Shape settings defaults if missing
    const defaultSettings = {
      theme: 'light',
      position: 'bottom-right',
      welcomeMessage: 'Hello! How can I help you today?',
      leadCapture: true,
      humanHandoff: true,
      maxTokens: 1000,
      temperature: 0.7,
      enableLiveAgents: true,
      transferPriority: 'fastest',
      transferTimeout: 30,
      gdpr: true,
      dataRetention30Days: true
    }

    return NextResponse.json({
      bot: {
        ...bot,
        settings: (bot as any).settings || defaultSettings,
        publicKey: (bot as any).publicKey || bot.id
      }
    })
  } catch (error) {
    console.error('Error fetching bot:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bot information' },
      { status: 500 }
    )
  }
}

