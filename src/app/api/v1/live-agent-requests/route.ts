import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get all live agent requests for a tenant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    const status = searchParams.get('status')

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenantId parameter' },
        { status: 400 }
      )
    }

    const whereClause: any = { tenantId }
    if (status) whereClause.status = status

    const requests = await db.liveChatRequest.findMany({
      where: whereClause,
      include: {
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 5
            },
            bot: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching live agent requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch live agent requests' },
      { status: 500 }
    )
  }
}

// Create a new live agent request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantId, conversationId, visitorId, botId, requestType, priority = 'normal' } = body

    if (!tenantId || !conversationId || !visitorId || !botId) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, conversationId, visitorId, botId' },
        { status: 400 }
      )
    }

    // Check if there's already a pending request for this conversation
    const existingRequest = await db.liveChatRequest.findFirst({
      where: {
        conversationId,
        status: { in: ['pending', 'assigned'] }
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Live agent request already exists for this conversation' },
        { status: 400 }
      )
    }

    // Create live agent request
    const liveChatRequest = await db.liveChatRequest.create({
      data: {
        tenantId,
        conversationId,
        priority,
        status: 'pending'
      },
      include: {
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 5
            }
          }
        }
      }
    })

    // Email notifications based on user preferences
    try {
      const { notifyLiveAgentRequested } = await import('@/lib/notifications')
      await notifyLiveAgentRequested({ tenantId, conversationId })
    } catch (e) {
      console.log('[notify] live-agent email skipped:', e)
    }

    return NextResponse.json({ liveChatRequest })
  } catch (error) {
    console.error('Error creating live agent request:', error)
    return NextResponse.json(
      { error: 'Failed to create live agent request' },
      { status: 500 }
    )
  }
}

// Update live agent request status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, status, assignedAgentId, notes } = body

    if (!requestId) {
      return NextResponse.json(
        { error: 'Missing required field: requestId' },
        { status: 400 }
      )
    }

    const updateData: any = { status }
    if (assignedAgentId) updateData.assignedAgentId = assignedAgentId
    if (notes) updateData.notes = notes
    if (status === 'assigned') updateData.assignedAt = new Date()
    if (status === 'completed') updateData.completedAt = new Date()

    const liveChatRequest = await db.liveChatRequest.update({
      where: { id: requestId },
      data: updateData,
      include: {
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 5
            }
          }
        },
        agent: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ liveChatRequest })
  } catch (error) {
    console.error('Error updating live agent request:', error)
    return NextResponse.json(
      { error: 'Failed to update live agent request' },
      { status: 500 }
    )
  }
}

// Delete live agent request
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')

    if (!requestId) {
      return NextResponse.json(
        { error: 'Missing requestId parameter' },
        { status: 400 }
      )
    }

    await db.liveChatRequest.delete({
      where: { id: requestId }
    })

    return NextResponse.json({ message: 'Live agent request deleted successfully' })
  } catch (error) {
    console.error('Error deleting live agent request:', error)
    return NextResponse.json(
      { error: 'Failed to delete live agent request' },
      { status: 500 }
    )
  }
}
