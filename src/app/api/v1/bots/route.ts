import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Persistent in-memory fallback storage when database is not available
// Use a global variable so it survives module reloads in dev/serverless
const getGlobalFallback = (): any[] => {
  // @ts-ignore
  if (!globalThis.__querywing_fallbackBots) {
    // @ts-ignore
    globalThis.__querywing_fallbackBots = [] as any[]
  }
  // @ts-ignore
  return globalThis.__querywing_fallbackBots as any[]
}

let fallbackBots: any[] = getGlobalFallback()

// Global conversations store for realtime counts (populated by chat API)
// @ts-ignore
const fbConversations: any[] = globalThis.__querywing_fallbackConversations || []

// Import plan configuration
import { getPlanConfig } from '@/lib/plan-config'

// Tenant plans cache (no demo default)
// @ts-ignore
if (!globalThis.__querywing_tenantPlans) { globalThis.__querywing_tenantPlans = {} }
// @ts-ignore
const tenantPlans: Record<string, string> = globalThis.__querywing_tenantPlans

// Get plan limits from configuration
const getPlanLimits = (planName: string) => {
  const config = getPlanConfig(planName)
  return {
    maxBots: config.maxBots,
    maxLiveAgents: config.maxLiveAgents,
    botCredits: config.botCredits,
    maxLeads: config.maxLeads
  }
}

const persistFallback = () => {
  // @ts-ignore
  globalThis.__querywing_fallbackBots = fallbackBots
}

// Default bot settings
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

// Helper to transform DB bot
const transformDbBot = (bot: any) => ({
  id: bot.id,
  name: bot.name,
  description: bot.description,
  instructions: bot.instructions,
  status: bot.status,
  conversations: bot.conversations?.length || 0,
  leads: bot.conversations?.filter((conv: any) => conv.lead).length || 0,
  createdAt: bot.createdAt?.toISOString?.() || new Date().toISOString(),
  updatedAt: bot.updatedAt?.toISOString?.() || bot.createdAt?.toISOString?.() || new Date().toISOString(),
  tenantId: bot.tenantId,
  publicKey: bot.publicKey,
  settings: bot.settings || defaultSettings
})

// Helper: merge DB bots with fallback (avoid duplicates by id)
const mergeBots = (dbBots: any[], fbBots: any[]) => {
  const map = new Map<string, any>()
  for (const b of dbBots) map.set(b.id, b)
  for (const b of fbBots) if (!map.has(b.id)) map.set(b.id, b)
  return Array.from(map.values())
}

function applyRealtimeCounts(bots: any[]) {
  if (!Array.isArray(fbConversations) || !fbConversations.length) return bots
  const counts = new Map<string, { conv: number; leads: number }>()
  for (const c of fbConversations) {
    if (!c?.botId) continue
    const prev = counts.get(c.botId) || { conv: 0, leads: 0 }
    prev.conv += 1
    // if any lead object present in conversation
    if (c.lead) prev.leads += 1
    counts.set(c.botId, prev)
  }
  return bots.map(b => {
    const stat = counts.get(b.id)
    if (stat) {
      return { ...b, conversations: stat.conv, leads: stat.leads }
    }
    return b
  })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  try {
    // Try to fetch from database first
    if (id) {
      const bot = await db.bot.findUnique({
        where: { id },
        include: { conversations: true }
      })
      if (bot) {
        const fb = fallbackBots.find(b => b.id === id)
        const base = transformDbBot(bot)
        const merged = {
          ...base,
          // Prefer DB values, but allow fallback overrides for fields not in DB (like settings when column missing)
          publicKey: (bot as any).publicKey || fb?.publicKey || base.id,
          settings: (bot as any).settings || fb?.settings || defaultSettings,
        }
        return NextResponse.json({ bot: merged })
      }
      // fallback
      const fb = fallbackBots.find(b => b.id === id)
      if (fb) {
        const shaped = {
          ...fb,
          createdAt: fb.createdAt || new Date().toISOString(),
          updatedAt: fb.updatedAt || fb.createdAt || new Date().toISOString(),
          publicKey: fb.publicKey || fb.id,
          settings: fb.settings || defaultSettings
        }
        return NextResponse.json({ bot: shaped })
      }
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const bots = await db.bot.findMany({
      include: {
        tenant: true,
        conversations: { include: { messages: true } }
      }
    })

    const transformedBots = bots.map(transformDbBot)
    const transformedFallback = fallbackBots.map((b) => ({
      ...b,
      createdAt: b.createdAt || new Date().toISOString(),
      updatedAt: b.updatedAt || b.createdAt || new Date().toISOString(),
      publicKey: b.publicKey || b.id,
      settings: b.settings || defaultSettings
    }))
    const merged = mergeBots(transformedBots, transformedFallback)

    // apply realtime counts from fallback conversations (if present)
    const withCounts = applyRealtimeCounts(merged)

    return NextResponse.json({ bots: withCounts })
  } catch (error) {
    console.error('Database error, using fallback data:', error)
    if (id) {
      // Try raw SQL as a compatibility fallback when Prisma schema and DB differ
      try {
        // @ts-ignore
        const rows: any[] = await db.$queryRaw`SELECT id, name, description, instructions, status, "createdAt", "tenantId" FROM bots WHERE id = ${id}`
        if (rows && rows[0]) {
          const row = rows[0]
          const shaped = {
            id: row.id,
            name: row.name,
            description: row.description || '',
            instructions: row.instructions || '',
            status: row.status || 'active',
            conversations: 0,
            leads: 0,
            createdAt: (row.createdAt?.toISOString?.() || new Date().toISOString()),
            updatedAt: (row.createdAt?.toISOString?.() || new Date().toISOString()),
            tenantId: row.tenantId,
            publicKey: row.id,
            settings: (fallbackBots.find(b => b.id === row.id)?.settings) || defaultSettings,
          }
          return NextResponse.json({ bot: shaped })
        }
      } catch (rawErr) {
        console.error('Raw SQL fallback also failed:', rawErr)
      }
      const fb = fallbackBots.find(b => b.id === id)
      if (fb) return NextResponse.json({ bot: fb })
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const withCounts = applyRealtimeCounts(fallbackBots)
    return NextResponse.json({ 
      bots: withCounts,
      message: 'Using fallback data - database connection unavailable'
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, instructions, tenantId: incomingTenantId } = body

    if (!name || !description || !instructions) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, instructions' },
        { status: 400 }
      )
    }

    // Try to create in database first
    try {
      const tenantId = incomingTenantId
      const tenant = await db.tenant.upsert({
        where: { id: tenantId }, update: {}, create: { id: tenantId, name: 'Workspace', plan: 'starter', settings: {} }
      })

      // enforce plan limits
      const count = await db.bot.count({ where: { tenantId: tenant.id } })
      const limit = getPlanLimits((tenant as any).plan || 'starter').maxBots
      if (typeof limit === 'number' && count >= limit) {
        return NextResponse.json({ error: `Plan limit reached (${limit} bots)` }, { status: 403 })
      }

      const createData: any = { name, description, instructions, status: 'active', tenantId: tenant.id, settings: defaultSettings }
      const bot = await db.bot.create({
        data: createData,
        include: { tenant: true }
      })

      const transformedBot = transformDbBot(bot)

      return NextResponse.json({ bot: transformedBot })
    } catch (dbError) {
      console.error('Database error, using fallback storage:', dbError)
      
      const tenantId = incomingTenantId
      const plan = tenantPlans[tenantId] || 'starter'
      const tenantBotCount = fallbackBots.filter(b => b.tenantId === tenantId).length
      const limit = getPlanLimits(plan).maxBots
      if (typeof limit === 'number' && tenantBotCount >= limit) {
        return NextResponse.json({ error: `Plan limit reached (${limit} bots)` }, { status: 403 })
      }

      const newBot = {
        id: `fallback-bot-${Date.now()}`,
        name,
        description,
        instructions,
        status: 'active' as const,
        conversations: 0,
        leads: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tenantId,
        publicKey: `fb_${Math.random().toString(36).slice(2)}`,
        settings: defaultSettings
      }

      fallbackBots.unshift(newBot)
      persistFallback()

      return NextResponse.json({ 
        bot: newBot,
        message: 'Bot created in fallback storage - database unavailable'
      })
    }
  } catch (error) {
    console.error('Error creating bot:', error)
    return NextResponse.json(
      { error: 'Failed to create bot' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { botId, name, description, instructions, status, settings } = body

    if (!botId) {
      return NextResponse.json(
        { error: 'Missing required field: botId' },
        { status: 400 }
      )
    }

    // Build update data object with only provided fields
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (instructions !== undefined) updateData.instructions = instructions
    if (status !== undefined) updateData.status = status
    if (settings !== undefined) updateData.settings = settings

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    try {
      const bot = await db.bot.update({
        where: { id: botId },
        data: updateData,
        include: { tenant: true, conversations: { include: { messages: true } } }
      })

      const transformedBot = transformDbBot(bot)
      return NextResponse.json({ bot: transformedBot })
    } catch (dbError) {
      console.error('Database error, updating fallback storage:', dbError)
      const botIndex = fallbackBots.findIndex(bot => bot.id === botId)
      if (botIndex !== -1) {
        // Update fallback bot with provided fields
        Object.assign(fallbackBots[botIndex], updateData)
        persistFallback()
        return NextResponse.json({ 
          bot: fallbackBots[botIndex],
          message: 'Bot updated in fallback storage - database unavailable'
        })
      } else {
        return NextResponse.json(
          { error: 'Bot not found' },
          { status: 404 }
        )
      }
    }
  } catch (error) {
    console.error('Error updating bot:', error)
    return NextResponse.json(
      { error: 'Failed to update bot' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const botId = searchParams.get('botId')

    if (!botId) {
      return NextResponse.json(
        { error: 'Missing botId parameter' },
        { status: 400 }
      )
    }

    try {
      await db.bot.delete({ where: { id: botId } })
      return NextResponse.json({ message: 'Bot deleted successfully' })
    } catch (dbError) {
      console.error('Database error, deleting from fallback storage:', dbError)
      const botIndex = fallbackBots.findIndex(bot => bot.id === botId)
      if (botIndex !== -1) {
        fallbackBots.splice(botIndex, 1)
        persistFallback()
        return NextResponse.json({ message: 'Bot deleted from fallback storage - database unavailable' })
      } else {
        return NextResponse.json(
          { error: 'Bot not found' },
          { status: 404 }
        )
      }
    }
  } catch (error) {
    console.error('Error deleting bot:', error)
    return NextResponse.json(
      { error: 'Failed to delete bot' },
      { status: 500 }
    )
  }
}
