import { NextRequest, NextResponse } from 'next/server'
import { LeadSchema } from '@/types/api'
import { 
  verifyToken, 
  extractToken, 
  getBotByPublicKey,
  createApiResponse,
  createErrorResponse,
  handleCors,
  logApiRequest,
} from '@/lib/api'
import { db } from '@/lib/db'

// usage limits (fallback)
import { getPlanConfig } from '@/lib/plan-config'

// @ts-ignore
const usage: Record<string, any> = globalThis.__querywing_usage || (globalThis.__querywing_usage = {})
// @ts-ignore
const tenantPlans: Record<string, string> = globalThis.__querywing_tenantPlans || {}

// Get plan limits from configuration
const getPlanLeadLimit = (planName: string) => {
  const config = getPlanConfig(planName)
  return config.maxLeads
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Handle CORS
    const corsResponse = handleCors(request)
    if (corsResponse) return corsResponse

    // Extract and verify token
    const authHeader = request.headers.get('authorization')
    let payload: any
    try {
      const token = extractToken(authHeader)
      payload = verifyToken(token)
    } catch { return createErrorResponse('Unauthorized', 401) }
    
    // Get bot and validate
    const bot = await getBotByPublicKey(payload.botId)
    
    // Validate request body
    const body = await LeadSchema.parseAsync(await request.json())
    
    // Verify conversation exists and belongs to this bot
    const conversation = await db.conversation.findUnique({
      where: { id: body.conversationId },
      include: { bot: true }
    })
    
    if (!conversation) {
      return createErrorResponse('Conversation not found', 404)
    }
    
    if (conversation.bot.id !== bot.id) {
      return createErrorResponse('Conversation does not belong to this bot', 403)
    }
    
    // Check if lead already exists for this conversation
    const existingLead = await db.lead.findFirst({
      where: { conversationId: body.conversationId }
    })
    
    if (existingLead) {
      return createErrorResponse('Lead already exists for this conversation', 409)
    }
    
    // Enforce quota by tenant plan
    const tenantId = bot?.tenantId
    const plan = tenantPlans[tenantId] || 'starter'
    const limit = getPlanLeadLimit(plan)
    const u = (usage[tenantId] = usage[tenantId] || { messages: 0, leads: 0 })
    if (typeof limit === 'number' && u.leads >= limit) {
      const duration = Date.now() - startTime
      logApiRequest('POST', '/api/v1/lead', 403, duration, tenantId)
      return createErrorResponse(`Lead limit reached for your ${plan} plan. Please upgrade to continue.`, 403)
    }

    // Create lead (also allow implicit capture from chat-only flows)
    const lead = await db.lead.create({
      data: {
        tenantId: bot.tenantId,
        conversationId: body.conversationId,
        name: body.name || 'Website Visitor',
        email: body.email,
        phone: body.phone,
        company: body.company,
        tags: ['widget-capture'],
        status: 'new',
        source: 'widget',
        botId: bot.id,
      }
    })
    
    // Note: Lead automatically references conversation via conversationId
    
    // Increment usage and log event
    u.leads += 1
    // Log event
    await db.event.create({
      data: {
        tenantId: bot.tenantId,
        type: 'lead.created',
        payloadJson: {
          leadId: lead.id,
          conversationId: body.conversationId,
          botId: bot.id,
          source: 'widget',
        }
      }
    })
    
    // Email notifications based on user preferences
    try {
      const { notifyLeadCreated } = await import('@/lib/notifications')
      await notifyLeadCreated({ tenantId: bot.tenantId, lead })
    } catch (e) {
      console.log('[notify] lead email skipped:', e)
    }
    
    const duration = Date.now() - startTime
    logApiRequest('POST', '/api/v1/lead', 200, duration, bot.tenantId)
    
    return createApiResponse({
      id: lead.id,
      success: true,
      message: 'Lead captured successfully'
    })
    
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error('Lead API error:', error)
    
    if (error.name === 'ApiError') {
      logApiRequest('POST', '/api/v1/lead', error.statusCode, duration)
      return createErrorResponse(error, error.statusCode)
    }
    
    logApiRequest('POST', '/api/v1/lead', 500, duration)
    return createErrorResponse('Internal server error', 500)
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 200 })
}
