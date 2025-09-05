import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Provision a tenant and starter bot after payment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name } = body || {}
    const tenantId = `tenant_${Date.now()}`

    try {
      await db.tenant.create({ data: { id: tenantId, name: name || 'Workspace', plan: 'pro', settings: {} } })
      const bot = await db.bot.create({ data: { name: 'Website Assistant', description: 'Answers from your content', instructions: 'Be concise and helpful.', status: 'active', tenantId, settings: {} } })
      const embed = `<script async src="${process.env.NEXT_PUBLIC_APP_URL || ''}/widget.js" data-bot-id="${bot.id}" data-bot-name="${bot.name}" data-primary-color="#6366f1" data-position="bottom-right"></script>`
      return NextResponse.json({ tenantId, botId: bot.id, embed })
    } catch (dbError) {
      // Fallback to memory if DB not available
      // @ts-ignore
      const fbBots = (globalThis as any).__querywing_fallbackBots || ((globalThis as any).__querywing_fallbackBots = [])
      const botId = `fallback-bot-${Date.now()}`
      fbBots.unshift({ id: botId, name: 'Website Assistant', description: 'Answers from your content', instructions: 'Be concise and helpful.', status: 'active', conversations: 0, leads: 0, createdAt: new Date().toISOString(), tenantId })
      const embed = `<script async src="/widget.js" data-bot-id="${botId}" data-bot-name="Website Assistant" data-primary-color="#6366f1" data-position="bottom-right"></script>`
      return NextResponse.json({ tenantId, botId, embed, message: 'Provisioned in fallback mode' })
    }
  } catch (e) {
    return NextResponse.json({ error: 'Failed to provision workspace' }, { status: 500 })
  }
}


