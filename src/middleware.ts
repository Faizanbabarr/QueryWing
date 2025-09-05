import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export const config = { matcher: ['/api/:path*'] };

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  try {
    const token = request.headers.get('authorization')?.replace(/^[Bb]earer\s+/, '')
    if (token) {
      try {
        const session = await db.session.findUnique({ where: { token } })
        if (session) {
          const user = await db.user.findUnique({ where: { id: session.userId } })
          if (user?.tenantId) {
            response.headers.set('x-tenant-id', user.tenantId)
          }
        }
      } catch {}
    }
  } catch {}
  return response
}
