import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get all live agents for a tenant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenantId parameter' },
        { status: 400 }
      )
    }

    const liveAgents = await db.liveAgent.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ liveAgents })
  } catch (error) {
    console.error('Error fetching live agents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch live agents' },
      { status: 500 }
    )
  }
}

// Create a new live agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantId, userId: incomingUserId, name, email, hourlyRate, status } = body

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing required field: tenantId' },
        { status: 400 }
      )
    }

    // Ensure tenant exists (avoid FK errors)
    try {
      await db.tenant.upsert({
        where: { id: tenantId },
        update: {},
        create: { id: tenantId, name: 'Workspace', plan: 'starter', settings: {} }
      })
    } catch (e) {
      // If Cockroach is unavailable, continue and let user creation fail loudly
      console.warn('[live-agents] tenant upsert warning:', e)
    }

    // Resolve or create a User for this agent
    let userId = incomingUserId as string | undefined
    if (!userId) {
      if (!email) {
        return NextResponse.json(
          { error: 'Missing required field: email (or provide userId)' },
          { status: 400 }
        )
      }
      // Try find existing user by tenant + email
      const existingUser = await db.user.findFirst({ where: { tenantId, email } })
      if (existingUser) {
        userId = existingUser.id
      } else {
        const created = await db.user.create({
          data: {
            tenantId,
            role: 'agent',
            name: (name || 'Live Agent').trim(),
            email: email.trim(),
            emailVerified: false,
            avatarUrl: null
          }
        })
        userId = created.id
      }
    } else {
      // If provided userId doesn't exist, fall back to email flow (if provided)
      const check = await db.user.findUnique({ where: { id: userId } })
      if (!check) {
        if (!email) {
          return NextResponse.json(
            { error: 'Provided userId does not exist and no email was provided to create a user' },
            { status: 400 }
          )
        }
        const existingUser = await db.user.findFirst({ where: { tenantId, email } })
        if (existingUser) {
          userId = existingUser.id
        } else {
          const created = await db.user.create({
            data: {
              tenantId,
              role: 'agent',
              name: (name || 'Live Agent').trim(),
              email: email.trim(),
              emailVerified: false,
              avatarUrl: null
            }
          })
          userId = created.id
        }
      }
    }

    // Prevent duplicates
    const existingAgent = await db.liveAgent.findFirst({ where: { userId, tenantId } })
    if (existingAgent) {
      return NextResponse.json(
        { error: 'User is already a live agent for this tenant' },
        { status: 400 }
      )
    }

    const liveAgent = await db.liveAgent.create({
      data: {
        tenantId,
        userId,
        name: name || 'Live Agent',
        email: email || undefined,
        status: (status as string) || 'available',
        // @ts-ignore allow optional hourlyRate injection if present
        hourlyRate: typeof hourlyRate === 'number' ? hourlyRate : undefined,
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    })

    return NextResponse.json({ liveAgent })
  } catch (error) {
    console.error('Error creating live agent:', error)
    return NextResponse.json(
      { error: 'Failed to create live agent' },
      { status: 500 }
    )
  }
}

// Update live agent status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, status, isOnline } = body

    if (!agentId) {
      return NextResponse.json(
        { error: 'Missing required field: agentId' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (isOnline !== undefined) updateData.isOnline = isOnline
    if (isOnline !== undefined) updateData.lastActive = new Date()

    const liveAgent = await db.liveAgent.update({
      where: { id: agentId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ liveAgent })
  } catch (error) {
    console.error('Error updating live agent:', error)
    return NextResponse.json(
      { error: 'Failed to update live agent' },
      { status: 500 }
    )
  }
}

// Delete live agent
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')

    if (!agentId) {
      return NextResponse.json(
        { error: 'Missing agentId parameter' },
        { status: 400 }
      )
    }

    await db.liveAgent.delete({
      where: { id: agentId }
    })

    return NextResponse.json({ message: 'Live agent deleted successfully' })
  } catch (error) {
    console.error('Error deleting live agent:', error)
    return NextResponse.json(
      { error: 'Failed to delete live agent' },
      { status: 500 }
    )
  }
}
