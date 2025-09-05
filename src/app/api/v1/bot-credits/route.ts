import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get bot credits for a tenant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        plan: true,
        botCredits: true,
        maxBots: true,
        maxLiveAgents: true
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Get current bot count
    const botCount = await db.bot.count({
      where: { tenantId }
    })

    // Get current live agent count
    const liveAgentCount = await db.liveAgent.count({
      where: { tenantId }
    })

    return NextResponse.json({
      tenant: {
        ...tenant,
        currentBots: botCount,
        currentLiveAgents: liveAgentCount
      }
    })
  } catch (error) {
    console.error('Error fetching bot credits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bot credits' },
      { status: 500 }
    )
  }
}

// Purchase bot credits or add-ons
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantId, type, quantity, amount } = body

    if (!tenantId || !type || !quantity || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, type, quantity, amount' },
        { status: 400 }
      )
    }

    const tenant = await db.tenant.findUnique({
      where: { id: tenantId }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    let updateData: any = {}

    switch (type) {
      case 'bot_credits':
        updateData.botCredits = { increment: quantity }
        break
      case 'additional_bots':
        updateData.maxBots = { increment: quantity }
        break
      case 'live_agents':
        updateData.maxLiveAgents = { increment: quantity }
        break
      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be bot_credits, additional_bots, or live_agents' },
          { status: 400 }
        )
    }

    const updatedTenant = await db.tenant.update({
      where: { id: tenantId },
      data: updateData
    })

    // Log the purchase
    await db.event.create({
      data: {
        tenantId,
        type: 'addon_purchased',
        payloadJson: {
          type,
          quantity,
          amount,
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      tenant: updatedTenant,
      message: `Successfully purchased ${quantity} ${type}`
    })
  } catch (error) {
    console.error('Error purchasing add-on:', error)
    return NextResponse.json(
      { error: 'Failed to purchase add-on' },
      { status: 500 }
    )
  }
}
