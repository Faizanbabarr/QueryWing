import crypto from 'crypto'

const SALT_LEN = 16
const KEY_LEN = 64
const N = 16384, r = 8, p = 1

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LEN)
  const derived = crypto.scryptSync(password, salt, KEY_LEN, { N, r, p }) as Buffer
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [algo, saltHex, hashHex] = stored.split('$')
    if (algo !== 'scrypt') return false
    const salt = Buffer.from(saltHex, 'hex')
    const derived = crypto.scryptSync(password, salt, KEY_LEN, { N, r, p }) as Buffer
    return crypto.timingSafeEqual(derived, Buffer.from(hashHex, 'hex'))
  } catch { return false }
}

export function createSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function savePasswordHash(userId: string, hash: string) {
  const { db } = await import('@/lib/db')
  try {
    // Preferred: dedicated table
    // @ts-ignore
    if (typeof (db as any).password?.create === 'function') {
      await (db as any).password.create({ data: { userId, hash } })
      return
    }
    throw new Error('password model not available')
  } catch {
    try {
      // Fallback: store in events
      const user = await db.user.findUnique({ where: { id: userId } })
      const tenantId = user?.tenantId || ''
      await db.event.create({ data: { tenantId, type: 'auth.password', payloadJson: { userId, hash } } as any })
    } catch {}
  }
}

export async function createSession(userId: string, token: string, days = 30) {
  const { db } = await import('@/lib/db')
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  try {
    // @ts-ignore
    if (typeof (db as any).session?.create === 'function') {
      await (db as any).session.create({ data: { userId, token, expiresAt: expires } })
      return expires
    }
    throw new Error('session model not available')
  } catch {
    try {
      const user = await db.user.findUnique({ where: { id: userId } })
      const tenantId = user?.tenantId || ''
      await db.event.create({ data: { tenantId, type: 'auth.session', payloadJson: { userId, token, expiresAt: expires.toISOString() } } as any })
    } catch {}
    return expires
  }
}

export async function verifySession(token: string) {
  const { db } = await import('@/lib/db')
  try {
    // @ts-ignore
    if (typeof (db as any).session?.findUnique === 'function') {
      const s = await (db as any).session.findUnique({ where: { token } })
      if (!s) return null
      if (s.expiresAt < new Date()) return null
      return s
    }
    throw new Error('session model not available')
  } catch {
    try {
      const ev = await db.event.findFirst({ where: { type: 'auth.session' }, orderBy: { createdAt: 'desc' } })
      const payload = (ev?.payloadJson as any) || {}
      if (payload?.token !== token) return null
      if (payload?.expiresAt && new Date(payload.expiresAt) < new Date()) return null
      return { id: ev?.id || '', userId: payload.userId, token, expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : new Date(Date.now() + 7*24*3600*1000) } as any
    } catch { return null }
  }
}

