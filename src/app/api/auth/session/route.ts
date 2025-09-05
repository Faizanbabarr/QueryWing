import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization') || ''
  if (auth.toLowerCase().startsWith('bearer ')) return auth.slice(7)
  const { searchParams } = new URL(req.url)
  return searchParams.get('token')
}

// Validate and slide the session expiration window
export async function GET(req: NextRequest) {
  try {
    const token = getToken(req)
    if (!token) {
      return NextResponse.json({ error: 'Missing session token' }, { status: 401 })
    }

    const session = await db.session.findUnique({ where: { token } })
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

    if (session.expiresAt <= new Date()) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    // Sliding expiration: extend by 7 days on activity
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await db.session.update({ where: { token }, data: { expiresAt: newExpiry } })

    return NextResponse.json({ ok: true, expiresAt: newExpiry.toISOString() })
  } catch (e) {
    console.error('Session check error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Explicit logout
export async function DELETE(req: NextRequest) {
  try {
    const token = getToken(req)
    if (!token) return NextResponse.json({ error: 'Missing session token' }, { status: 400 })
    await db.session.delete({ where: { token } }).catch(() => {})
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Session delete error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


