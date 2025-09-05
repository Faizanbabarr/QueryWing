import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const botId = searchParams.get('botId')

    // Try to fetch from database first
    const leads = await db.lead.findMany({
      where: { ...(status && { status: status as any }), ...(source && { source: source as any }), ...(botId && { botId }) },
      include: { conversation: { include: { bot: true } } },
      orderBy: { capturedAt: 'desc' },
      take: limit
    })

    const transformedLeads = leads.map(lead => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      status: lead.status,
      source: lead.source,
      tags: lead.tags,
      capturedAt: lead.capturedAt.toISOString(),
      botId: lead.botId || lead.conversation?.bot?.id || null,
      conversationId: lead.conversationId,
      bot: lead.conversation?.bot ? {
        id: lead.conversation.bot.id,
        name: lead.conversation.bot.name
      } : null
    }))

    return NextResponse.json({ 
      leads: transformedLeads,
      total: leads.length
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to load leads' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, company, status = 'new', source = 'chat', tags = [], botId, conversationId } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: name and email' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Require tenantId from body when creating lead
    const tenantId = body.tenantId
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing required field: tenantId' },
        { status: 400 }
      )
    }

    // Check if we need to create a default bot
    let actualBotId = botId
    if (!actualBotId) {
      try {
        // Try to find an existing bot
        const existingBot = await db.bot.findFirst({ where: { tenantId } })
        
        if (existingBot) {
          actualBotId = existingBot.id
        } else {
          // Create a default bot if none exists
          const defaultBot = await db.bot.create({
            data: {
              tenantId,
              name: 'Default Bot',
              description: 'Default chatbot for lead capture',
              instructions: 'Capture lead information and provide basic assistance',
              temperature: 0.7,
              topP: 0.9,
              retrievalMode: 'hybrid',
              status: 'active',
              published: true,
              publicKey: `default-bot-${Date.now()}`
            }
          })
          actualBotId = defaultBot.id
        }
      } catch (botError) {
        console.error('Error creating/finding bot:', botError)
        return NextResponse.json(
          { error: 'Failed to setup bot for lead creation. Please try again.' },
          { status: 500 }
        )
      }
    }

    // Create conversation if not provided
    let actualConversationId = conversationId
    if (!actualConversationId) {
      try {
        const conversation = await db.conversation.create({
          data: {
            botId: actualBotId,
            visitorId: `visitor_${Date.now()}`,
            status: 'active'
          }
        })
        actualConversationId = conversation.id
      } catch (convError) {
        console.error('Error creating conversation:', convError)
        return NextResponse.json(
          { error: 'Failed to create conversation for lead. Please try again.' },
          { status: 500 }
        )
      }
    }

    try {
      const lead = await db.lead.create({
        data: {
          tenantId,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone ? phone.trim() : null,
          company: company ? company.trim() : null,
          status,
          source: source.trim(),
          tags: Array.isArray(tags) ? tags : [],
          botId: actualBotId,
          conversationId: actualConversationId
        },
        include: { conversation: { include: { bot: true } } }
      })

      const transformedLead = {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        status: lead.status,
        source: lead.source,
        tags: lead.tags,
        capturedAt: lead.capturedAt.toISOString(),
        botId: lead.botId,
        conversationId: lead.conversationId,
        bot: lead.conversation?.bot ? {
          id: lead.conversation.bot.id,
          name: lead.conversation.bot.name
        } : null
      }

      return NextResponse.json({ 
        lead: transformedLead,
        message: 'Lead created successfully'
      })
    } catch (dbError) {
      console.error('Database error during lead creation:', dbError)
      if (dbError instanceof Error) {
        if (dbError.message.includes('Unique constraint')) {
          return NextResponse.json(
            { error: 'A lead with this email already exists' },
            { status: 400 }
          )
        }
        if (dbError.message.includes('Foreign key constraint')) {
          return NextResponse.json(
            { error: 'Invalid bot or conversation reference' },
            { status: 400 }
          )
        }
      }
      return NextResponse.json(
        { error: 'Failed to create lead in database' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error creating lead:', error)
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create lead. Please try again.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, email, phone, company, status, source, tags, notes } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      )
    }

    // Update lead in database
    try {
      const lead = await db.lead.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(phone !== undefined && { phone }),
          ...(company !== undefined && { company }),
          ...(status && { status }),
          ...(source && { source }),
          ...(tags && { tags }),
          ...(notes !== undefined && { notes })
        },
        include: {
          conversation: {
            include: {
              bot: true
            }
          }
        }
      })

      const transformedLead = {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        status: lead.status,
        source: lead.source,
        tags: lead.tags,
        capturedAt: lead.capturedAt.toISOString(),
        botId: lead.botId,
        conversationId: lead.conversationId,
        bot: lead.conversation?.bot ? {
          id: lead.conversation.bot.id,
          name: lead.conversation.bot.name
        } : null
      }

      return NextResponse.json({ lead: transformedLead })
    } catch (dbError) {
      console.error('Database error during lead update:', dbError)
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error updating lead:', error)
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      )
    }

    // Delete lead from database
    try {
      await db.lead.delete({
        where: { id }
      })

      return NextResponse.json({ success: true })
    } catch (dbError) {
      console.error('Database error during lead deletion:', dbError)
      return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error deleting lead:', error)
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    )
  }
}
