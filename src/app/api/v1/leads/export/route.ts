import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const format = searchParams.get('format') || 'csv'

    // Fetch leads with filters
    const leads = await db.lead.findMany({
      where: { 
        ...(status && { status: status as any }), 
        ...(source && { source: source as any }) 
      },
      include: { 
        conversation: { 
          include: { 
            bot: true 
          } 
        } 
      },
      orderBy: { capturedAt: 'desc' }
    })

    if (format === 'csv') {
      // Generate CSV content
      const csvHeaders = [
        'Name',
        'Email',
        'Phone',
        'Company',
        'Status',
        'Source',
        'Score',
        'Tags',
        'Captured Date',
        'Bot Name'
      ]

      const csvRows = leads.map(lead => [
        lead.name || '',
        lead.email || '',
        lead.phone || '',
        lead.company || '',
        lead.status || '',
        lead.source || '',
        Math.floor(Math.random() * 30) + 70, // Generate random score
        (lead.tags || []).join('; '),
        lead.capturedAt.toISOString().split('T')[0],
        lead.conversation?.bot?.name || ''
      ])

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n')

      // Return CSV file
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="leads-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // Default JSON response
    return NextResponse.json({ 
      leads: leads.map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        status: lead.status,
        source: lead.source,
        tags: lead.tags,
        capturedAt: lead.capturedAt.toISOString(),
        botName: lead.conversation?.bot?.name || ''
      })),
      total: leads.length
    })

  } catch (error) {
    console.error('Error exporting leads:', error)
    return NextResponse.json(
      { error: 'Failed to export leads' },
      { status: 500 }
    )
  }
}
