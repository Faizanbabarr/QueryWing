import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Simple in-memory fallback store when DB is unavailable in dev/demo
// @ts-ignore
const globalState = globalThis as any
if (!globalState.__querywing_notificationPrefs) {
  globalState.__querywing_notificationPrefs = new Map<string, any>()
}
const memStore: Map<string, any> = globalState.__querywing_notificationPrefs

async function getPrefsFromDb(userId: string) {
  try {
    const user = await db.user.findUnique({ where: { id: userId }, select: { notificationPreferences: true } })
    const raw = (user as any)?.notificationPreferences
    return raw && typeof raw === 'object' ? raw : null
  } catch {
    return null
  }
}

async function setPrefsInDb(userId: string, prefs: any) {
  try {
    await db.user.update({ where: { id: userId }, data: { notificationPreferences: prefs } as any })
    return true
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId') || ''
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const defaults = { email: true, browser: true, leads: true, conversations: true, weeklyReports: false }

  // Try DB first
  const dbPrefs = await getPrefsFromDb(userId)
  if (dbPrefs) return NextResponse.json({ preferences: { ...defaults, ...dbPrefs } })

  // Fallback to memory
  const mem = memStore.get(userId)
  return NextResponse.json({ preferences: { ...defaults, ...(mem || {}) } })
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const userId: string = body.userId
    const preferences = body.preferences || {}
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    // Attempt to persist in DB; if it fails, keep in memory so UI works
    const saved = await setPrefsInDb(userId, preferences)
    if (!saved) {
      memStore.set(userId, preferences)
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
