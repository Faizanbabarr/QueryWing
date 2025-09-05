import { NextRequest, NextResponse } from 'next/server'
import { sendWeeklyReportEmail } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await request.json()
    if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 })

    await sendWeeklyReportEmail({ tenantId })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}


