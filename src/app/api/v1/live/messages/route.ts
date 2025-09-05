import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// In-memory fallback shared with /api/v1/live
// @ts-ignore
const liveRequests: any[] = globalThis.__querywing_liveRequests || []

function json(data: any, status = 200) {
  return NextResponse.json(data, { status })
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
      return json({ messages: [] })
    }

    const messages = await db.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    })

    return json({ messages })
  } catch (e) {
    console.error('live/messages GET error:', e)
    return json({ error: 'Failed to fetch messages' }, 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, conversationId: conversationIdBody, content } = body || {}

    if (!content || (!requestId && !conversationIdBody)) {
      return json({ error: 'Missing content or identifiers' }, 400)
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
      return json({ error: 'Conversation not found' }, 404)
    }

    const msg = await db.message.create({
      data: {
        conversationId,
        role: 'agent',
        content
      }
    })

    return json({ message: msg })
  } catch (e) {
    console.error('live/messages POST error:', e)
    return json({ error: 'Failed to send message' }, 500)
  }
}

import { NextRequest, NextResponse } from 'next/server'

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
if (!globalThis.__querywing_liveRequests) { globalThis.__querywing_liveRequests = [] as any[] }
// @ts-ignore
const liveRequests: any[] = globalThis.__querywing_liveRequests

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const requestId = searchParams.get('requestId') || ''
  if (!requestId) return jsonWithCors({ error: 'requestId required' }, 400)
  const messages = liveMessages[requestId] || []
  const req = liveRequests.find(r => r.id === requestId) || null
  return jsonWithCors({ messages, status: req?.status || 'queued' })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, role, content } = body || {}
    if (!requestId || !role || !content) {
      return jsonWithCors({ error: 'requestId, role, content required' }, 400)
    }
    if (!liveMessages[requestId]) {
      liveMessages[requestId] = []
      liveMessages[requestId].push({ id: `sys_${Date.now()}`, role: 'system', content: 'Live session started', createdAt: new Date().toISOString() })
    }
    const msg = {
      id: `msg_${Date.now()}`,
      role,
      content,
      createdAt: new Date().toISOString()
    }
    liveMessages[requestId].push(msg)

    const r = liveRequests.find((r: any) => r.id === requestId)
    if (r && r.status === 'queued') r.status = 'in_progress'

    return jsonWithCors({ success: true, message: msg })
  } catch (e) {
    return jsonWithCors({ error: 'Failed to post message' }, 500)
  }
}


