import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    // Test database connection
    try {
      await db.$queryRaw`SELECT 1`
      console.log('[debug-users] Database connection successful')
    } catch (dbError) {
      console.error('[debug-users] Database connection failed:', dbError)
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 })
    }

    // Get all users (for debugging only - remove in production)
    const users = await db.user.findMany({
      select: { 
        id: true, 
        email: true, 
        name: true, 
        tenantId: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log('[debug-users] Found users:', users.length)

    return NextResponse.json({ 
      ok: true, 
      userCount: users.length,
      users: users
    })

  } catch (error) {
    console.error('Debug users error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
