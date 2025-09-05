import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getPlanConfig } from '@/lib/plan-config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId') || request.headers.get('x-tenant-id') || undefined as any
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenantId parameter' },
        { status: 400 }
      )
    }

    // Get real-time usage data
    const [
      tenant,
      bots,
      liveAgents,
      conversations,
      leads
    ] = await Promise.all([
      db.tenant.findUnique({
        where: { id: tenantId },
        select: {
          plan: true,
          botCredits: true,
          maxBots: true,
          maxLiveAgents: true
        }
      }),
      db.bot.count({ where: { tenantId, status: 'active' } }),
      db.liveAgent.count({ where: { tenantId, isActive: true } }),
      db.conversation.count({ 
        where: { 
          bot: { tenantId } 
        } 
      }),
      db.lead.count({ where: { tenantId } })
    ])

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Calculate usage percentages
    const botUsagePercentage = tenant.maxBots > 0 ? (bots / tenant.maxBots) * 100 : 0
    const liveAgentUsagePercentage = tenant.maxLiveAgents > 0 ? (liveAgents / tenant.maxLiveAgents) * 100 : 0
    
    // Get plan configuration for accurate limits
    const planConfig = getPlanConfig(tenant.plan)
    
    // Calculate credit usage based on actual plan limits
    let creditUsagePercentage = 0
    let usedCredits = 0
    if (planConfig.botCredits > 0) {
      usedCredits = Math.max(0, planConfig.botCredits - tenant.botCredits)
      creditUsagePercentage = (usedCredits / planConfig.botCredits) * 100
    }

    const usageData = {
      plan: tenant.plan,
      limits: {
        botCredits: planConfig.botCredits,
        maxBots: planConfig.maxBots,
        maxLiveAgents: planConfig.maxLiveAgents
      },
      current: {
        botCredits: tenant.botCredits,
        bots: bots,
        liveAgents: liveAgents
      },
      usage: {
        botCredits: {
          used: usedCredits,
          total: planConfig.botCredits,
          percentage: creditUsagePercentage
        },
        bots: {
          used: bots,
          total: planConfig.maxBots,
          percentage: botUsagePercentage
        },
        liveAgents: {
          used: liveAgents,
          total: planConfig.maxLiveAgents,
          percentage: liveAgentUsagePercentage
        }
      },
      analytics: {
        totalConversations: conversations,
        totalLeads: leads,
        totalTokensUsed: 0, // Simplified for now
        totalCost: 0 // Simplified for now
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(usageData)
  } catch (error) {
    console.error('Error fetching usage data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    )
  }
}


