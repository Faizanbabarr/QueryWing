import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
    }
    // Delete old demo data in reverse order to respect foreign key constraints
    await db.analytics.deleteMany({
      where: {
        tenantId: 'demo-tenant'
      }
    })

    await db.liveChatRequest.deleteMany({
      where: {
        tenantId: 'demo-tenant'
      }
    })

    await db.message.deleteMany({
      where: {
        conversationId: {
          in: ['demo-conv-1', 'demo-conv-2', 'demo-conv-3']
        }
      }
    })

    await db.lead.deleteMany({
      where: {
        id: {
          in: ['demo-lead-1', 'demo-lead-2', 'demo-lead-3']
        }
      }
    })

    await db.conversation.deleteMany({
      where: {
        id: {
          in: ['demo-conv-1', 'demo-conv-2', 'demo-conv-3']
        }
      }
    })

    await db.bot.deleteMany({
      where: {
        id: {
          in: ['demo-bot-1', 'demo-bot-2', 'demo-bot-3']
        }
      }
    })

    await db.tenant.deleteMany({
      where: {
        id: 'demo-tenant'
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Old demo data cleaned up successfully. Run /api/init-db to create new comprehensive data.'
    })
  } catch (error) {
    console.error('Error cleaning up demo data:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup demo data' },
      { status: 500 }
    )
  }
}
