import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get all bots with their status
    const bots = await db.bot.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            conversations: true,
            leads: true
          }
        }
      }
    })

    // Calculate health metrics
    const totalBots = bots.length
    const activeBots = bots.filter(bot => bot.status === 'active').length
    const publishedBots = bots.filter(bot => bot.published).length
    const inactiveBots = bots.filter(bot => bot.status !== 'active').length

    // Check for bots that might need attention
    const needsAttention = bots.filter(bot => 
      bot.status === 'active' && !bot.published
    ).length

    const healthStatus = {
      overall: totalBots > 0 ? 'healthy' : 'no_bots',
      metrics: {
        total: totalBots,
        active: activeBots,
        published: publishedBots,
        inactive: inactiveBots,
        needsAttention
      },
      bots: bots.map(bot => ({
        id: bot.id,
        name: bot.name,
        status: bot.status,
        published: bot.published,
        conversationCount: bot._count.conversations,
        leadCount: bot._count.leads,
        lastActivity: bot.updatedAt
      }))
    }

    return NextResponse.json(healthStatus)
  } catch (error) {
    console.error('Error checking bot health:', error)
    return NextResponse.json(
      { 
        overall: 'error',
        error: 'Failed to check bot health',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

