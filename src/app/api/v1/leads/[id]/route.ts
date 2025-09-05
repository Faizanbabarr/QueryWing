import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const lead = await db.lead.findUnique({
      where: { id },
      include: {
        conversation: {
          include: {
            bot: true
          }
        }
      }
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

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
  } catch (error) {
    console.error('Error fetching lead:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, email, phone, company, status, source, tags, notes, score } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required fields' },
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

    // Validate status
    const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'lost']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Validate score if provided
    if (score !== undefined && (typeof score !== 'number' || score < 0 || score > 100)) {
      return NextResponse.json(
        { error: 'Score must be a number between 0 and 100' },
        { status: 400 }
      )
    }

    // Check if lead exists before updating
    const existingLead = await db.lead.findUnique({
      where: { id }
    })

    if (!existingLead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Update lead in database
    try {
      const lead = await db.lead.update({
        where: { id },
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
          ...(company !== undefined && { company: company ? company.trim() : null }),
          ...(status && { status }),
          ...(source && { source: source.trim() }),
          ...(tags && { tags: Array.isArray(tags) ? tags : [] }),
          ...(notes !== undefined && { notes: notes ? notes.trim() : null }),
          ...(score !== undefined && { score })
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
      
      // Provide more specific error messages
      if (dbError instanceof Error) {
        if (dbError.message.includes('Unique constraint')) {
          return NextResponse.json(
            { error: 'A lead with this email already exists' },
            { status: 400 }
          )
        }
        if (dbError.message.includes('Foreign key constraint')) {
          return NextResponse.json(
            { error: 'Invalid conversation or bot reference' },
            { status: 400 }
          )
        }
      }
      
      return NextResponse.json({ 
        error: 'Failed to update lead in database',
        details: process.env.NODE_ENV === 'development' ? dbError : undefined
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error updating lead:', error)
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update lead. Please try again.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if lead exists before deleting
    const existingLead = await db.lead.findUnique({
      where: { id }
    })

    if (!existingLead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
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
      return NextResponse.json({ 
        error: 'Failed to delete lead from database',
        details: process.env.NODE_ENV === 'development' ? dbError : undefined
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error deleting lead:', error)
    return NextResponse.json(
      { error: 'Failed to delete lead. Please try again.' },
      { status: 500 }
    )
  }
}
