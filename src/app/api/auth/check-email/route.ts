import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    console.log('[check-email] Checking for email:', email)

    // Test database connection first
    try {
      await db.$queryRaw`SELECT 1`
      console.log('[check-email] Database connection successful')
    } catch (dbError) {
      console.error('[check-email] Database connection failed:', dbError)
      return NextResponse.json({ 
        error: 'Database connection failed' 
      }, { status: 500 })
    }

    // Check if user exists in database (case-insensitive)
    const user = await db.user.findFirst({
      where: { 
        email: {
          equals: email.toLowerCase(),
          mode: 'insensitive' // CockroachDB supports this
        }
      },
      select: { id: true, email: true, name: true }
    })

    console.log('[check-email] Database query result:', { found: !!user, email: email.toLowerCase() })

    if (!user) {
      // Also try exact match in case insensitive mode doesn't work
      const exactUser = await db.user.findFirst({
        where: { email: email },
        select: { id: true, email: true, name: true }
      })

      console.log('[check-email] Exact match result:', { found: !!exactUser, email: email })

      if (!exactUser) {
        return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 })
      }
    }

    // Return success (don't expose user details for security)
    return NextResponse.json({ 
      ok: true, 
      message: 'User found' 
    })

  } catch (error) {
    console.error('Check email error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
