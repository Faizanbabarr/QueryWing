import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type ClerkEvent = {
  type: string
  data: any
}

export async function POST(req: NextRequest) {
  try {
    const text = await req.text()
    // Best-effort verification: in production, use Svix and CLERK_WEBHOOK_SECRET.
    // For demo/local, accept and parse JSON.
    let evt: ClerkEvent
    try { evt = JSON.parse(text) } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

    const { type, data } = evt

    if (type === 'user.created') {
      const email = data?.email_addresses?.[0]?.email_address || data?.primary_email_address_id || data?.email || ''
      const name = [data?.first_name, data?.last_name].filter(Boolean).join(' ') || data?.username || 'User'

      // Create tenant and user if missing
      const tenant = await db.tenant.create({ data: { name: `${name}'s Workspace`, settings: {} } })
      await db.user.create({ data: { tenantId: tenant.id, role: 'owner', name, email, avatarUrl: data?.image_url || null } })
      return NextResponse.json({ ok: true })
    }

    if (type === 'user.updated') {
      const email = data?.email_addresses?.[0]?.email_address || ''
      if (email) {
        // Update latest user for any tenant with that email
        await db.user.updateMany({ where: { email }, data: { name: [data?.first_name, data?.last_name].filter(Boolean).join(' ') || data?.username || 'User', avatarUrl: data?.image_url || null } })
      }
      return NextResponse.json({ ok: true })
    }

    if (type === 'user.deleted') {
      // Soft-delete: optional. For demo, do nothing.
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}

export async function GET() { return NextResponse.json({ ok: true }) }


