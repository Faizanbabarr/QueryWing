import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

function jsonWithCors(data: any, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders })
}

// Global message store keyed by requestId
// @ts-ignore
if (!globalThis.__querywing_liveMessages) {
  // @ts-ignore
  globalThis.__querywing_liveMessages = {} as Record<string, any[]>
}
// @ts-ignore
const liveMessages: Record<string, any[]> = globalThis.__querywing_liveMessages

// Requests store
// @ts-ignore
if (!globalThis.__querywing_liveRequests) { 
  // @ts-ignore
  globalThis.__querywing_liveRequests = [] as any[] 
}
// @ts-ignore
const liveRequests: any[] = globalThis.__querywing_liveRequests

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')
    const conversationIdParam = searchParams.get('conversationId')

    let conversationId = conversationIdParam || ''

    if (!conversationId && requestId) {
      // Try DB-backed request first
      try {
        // @ts-ignore - model may differ between environments
        const req = await (db as any).liveAgentRequest?.findUnique?.({ where: { id: requestId } })
        if (req?.conversationId) conversationId = req.conversationId
      } catch {}

      // Fallback to in-memory mapping
      if (!conversationId) {
        const req = liveRequests.find(r => r.id === requestId)
        if (req?.conversationId) conversationId = req.conversationId
      }
    }

    if (!conversationId) {
      return jsonWithCors({ messages: [] })
    }

    const messages = await db.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    })

    return jsonWithCors({ messages })
  } catch (e) {
    console.error('live/messages GET error:', e)
    return jsonWithCors({ error: 'Failed to fetch messages' }, 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, conversationId: conversationIdBody, content, role } = body || {}

    if (!content || (!requestId && !conversationIdBody)) {
      return jsonWithCors({ error: 'Missing content or identifiers' }, 400)
    }

    let conversationId = conversationIdBody || ''
    if (!conversationId && requestId) {
      // Try DB-backed request
      try {
        // @ts-ignore
        const req = await (db as any).liveAgentRequest?.findUnique?.({ where: { id: requestId } })
        if (req?.conversationId) conversationId = req.conversationId
      } catch {}

      // Fallback to in-memory
      if (!conversationId) {
        const req = liveRequests.find(r => r.id === requestId)
        if (req?.conversationId) conversationId = req.conversationId
      }
    }

    if (!conversationId) {
      return jsonWithCors({ error: 'Conversation not found' }, 404)
    }

    const msg = await db.message.create({
      data: {
        conversationId,
        role: role || 'agent',
        content
      }
    })

    return jsonWithCors({ message: msg })
  } catch (e) {
    console.error('live/messages POST error:', e)
    return jsonWithCors({ error: 'Failed to send message' }, 500)
  }
}