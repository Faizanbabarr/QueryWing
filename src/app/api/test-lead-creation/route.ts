import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Test database connection
    const testQuery = await db.lead.count()
    console.log('Database connection test successful, current lead count:', testQuery)

    // Test creating a simple lead
    const testLead = await db.lead.create({
      data: {
        tenantId: 'demo-tenant',
        name: 'Test Lead',
        email: 'test@example.com',
        status: 'new',
        source: 'Test API',
        tags: ['test'],
        botId: 'demo-bot'
      }
    })

    console.log('Test lead created successfully:', testLead.id)

    // Clean up test lead
    await db.lead.delete({
      where: { id: testLead.id }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Lead creation test successful',
      databaseConnection: 'OK',
      testLeadCreated: true
    })
  } catch (error) {
    console.error('Lead creation test failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseConnection: 'FAILED'
    }, { status: 500 })
  }
}
