import { NextRequest, NextResponse } from 'next/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

function jsonWithCors(data: any, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders })
}

// Global in-memory store (survives hot reload in dev)
// @ts-ignore
if (!globalThis.__querywing_liveRequests) {
  // @ts-ignore
  globalThis.__querywing_liveRequests = [] as any[]
}
// @ts-ignore
const liveRequests: any[] = globalThis.__querywing_liveRequests

// Map conversationId -> liveRequestId
// @ts-ignore
if (!globalThis.__querywing_liveMap) { globalThis.__querywing_liveMap = {} as Record<string,string> }
// @ts-ignore
const liveMap: Record<string,string> = globalThis.__querywing_liveMap

async function sendEmailNotification(req: any) {
  try {
    // Prefer RESEND (no local dependency)
    if (process.env.RESEND_API_KEY && process.env.SUPPORT_EMAIL) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.SMTP_FROM || 'QueryWing <no-reply@querywing.dev>',
          to: process.env.SUPPORT_EMAIL,
          subject: `New Live Request: ${req.name}`,
          text: `New live chat request\n\nName: ${req.name}\nEmail: ${req.email||'N/A'}\nIssue: ${req.issue||'N/A'}\nCreated: ${req.createdAt}\nRequest ID: ${req.id}`
        })
      })
      return
    }

    const hasSmtpUrl = !!process.env.SMTP_URL
    const hasSmtpCreds = !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS
    if (!hasSmtpUrl && !hasSmtpCreds) return

    // Use eval import so bundler doesn't require nodemailer at build time
    const nodemailerMod: any = await (Function('return import("nodemailer")')())
    const nodemailer = nodemailerMod.default || nodemailerMod

    const transporter = hasSmtpUrl
      ? nodemailer.createTransport(process.env.SMTP_URL as string)
      : nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: Boolean(process.env.SMTP_SECURE === 'true'),
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        })

    const to = process.env.SUPPORT_EMAIL || process.env.SMTP_USER
    if (!to) return

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `QueryWing Live <no-reply@${(process.env.SMTP_HOST||'querywing.local')}>`,
      to,
      subject: `New Live Request: ${req.name}`,
      text: `New live chat request\n\nName: ${req.name}\nEmail: ${req.email||'N/A'}\nIssue: ${req.issue||'N/A'}\nCreated: ${req.createdAt}\nRequest ID: ${req.id}`
    })
  } catch (e) {
    console.error('Live request email notification failed:', e)
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

export async function GET() {
  return jsonWithCors({ requests: liveRequests })
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, conversationId, status = 'closed' } = body || {}

    let target = null as any
    if (requestId) target = liveRequests.find(r => r.id === requestId)
    if (!target && conversationId) target = liveRequests.find(r => r.conversationId === conversationId)

    if (!target) return jsonWithCors({ error: 'Request not found' }, 404)

    target.status = status
    if (target.conversationId && status === 'closed') {
      delete liveMap[target.conversationId]
    }

    return jsonWithCors({ success: true, request: target })
  } catch (e) {
    return jsonWithCors({ error: 'Failed to update request' }, 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, issue, conversationId, botId } = body || {}

    if (!email && !name && !issue) {
      return jsonWithCors({ error: 'Missing details' }, 400)
    }

    const req = {
      id: `live_${Date.now()}`,
      name: name || 'Visitor',
      email: email || null,
      issue: issue || '',
      conversationId: conversationId || null,
      botId: botId || null,
      status: 'in_progress',
      createdAt: new Date().toISOString()
    }

    liveRequests.unshift(req)
    if (req.conversationId) { liveMap[req.conversationId] = req.id }

    // best-effort email notification (non-blocking)
    sendEmailNotification(req).catch(()=>{})

    return jsonWithCors({ success: true, request: req, message: 'Live agent connected.' })
  } catch (e) {
    return jsonWithCors({ error: 'Failed to create live agent request' }, 500)
  }
}
