import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await db.$queryRaw`SELECT 1`
    
    // Test basic operations
    const tenantCount = await db.tenant.count()
    const userCount = await db.user.count()
    const botCount = await db.bot.count()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      stats: {
        tenants: tenantCount,
        users: userCount,
        bots: botCount
      }
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}
