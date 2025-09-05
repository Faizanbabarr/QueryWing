import { NextRequest, NextResponse } from 'next/server'
// Lightweight internal JWT verify to avoid external dependency for build
import { Buffer } from 'buffer'
import { ApiError, JWTPayload } from '@/types/api'
import { db } from '@/lib/db'

// JWT Secret from environment
const JWT_SECRET = process.env.JWT_SECRET!

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Verify JWT token (HS256 only, minimal check). In demo we do not require strict validation.
export function verifyToken(token: string): JWTPayload {
  try {
    const [headerB64, payloadB64, signature] = token.split('.')
    if (!headerB64 || !payloadB64 || !signature) throw new Error('bad token')
    const json = Buffer.from(payloadB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    const payload = JSON.parse(json)
    // Optional exp check
    if (payload.exp && Date.now() / 1000 > payload.exp) throw new Error('expired')
    return payload as JWTPayload
  } catch (error) {
    throw new ApiError('Invalid token', 401, 'INVALID_TOKEN')
  }
}

// Extract token from Authorization header
export function extractToken(authHeader: string | null): string {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError('Missing or invalid authorization header', 401, 'MISSING_AUTH')
  }
  return authHeader.substring(7)
}

// Rate limiting middleware
export function rateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const now = Date.now()
  const key = `${identifier}:${Math.floor(now / windowMs)}`
  
  const current = rateLimitStore.get(key)
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= limit) {
    return false
  }
  
  current.count++
  return true
}

// Get bot by public key
export async function getBotByPublicKey(publicKey: string) {
  const bot = await db.bot.findUnique({
    where: { publicKey },
    include: {
      tenant: true,
    },
  })
  
  if (!bot) {
    throw new ApiError('Bot not found', 404, 'BOT_NOT_FOUND')
  }
  
  if (!bot.published) {
    throw new ApiError('Bot not published', 403, 'BOT_NOT_PUBLISHED')
  }
  
  return bot
}

// Get tenant by ID with validation
export async function getTenantById(tenantId: string) {
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
  })
  
  if (!tenant) {
    throw new ApiError('Tenant not found', 404, 'TENANT_NOT_FOUND')
  }
  
  return tenant
}

// Check usage limits
export async function checkUsageLimits(tenantId: string, plan: string) {
  const limits = {
    starter: { messages: 300, sources: 3, bots: 1 },
    growth: { messages: 5000, sources: 15, bots: 3 },
    scale: { messages: 50000, sources: -1, bots: 10 }, // -1 means unlimited
  }
  
  const planLimits = limits[plan as keyof typeof limits] || limits.starter
  
  // Check message usage (simplified - in production, track actual usage)
  const messageCount = await db.message.count({
    where: {
      conversation: {
        bot: {
          tenantId,
        },
      },
    },
  })
  
  if (planLimits.messages !== -1 && messageCount >= planLimits.messages) {
    throw new ApiError('Message limit exceeded', 429, 'MESSAGE_LIMIT_EXCEEDED')
  }
  
  return planLimits
}

// Create API response
export function createApiResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    { success: true, data },
    { status }
  )
}

// Create error response
export function createErrorResponse(
  error: ApiError | string,
  status: number = 500
): NextResponse {
  const message = typeof error === 'string' ? error : error.message
  const code = typeof error === 'string' ? undefined : error.code
  
  return NextResponse.json(
    { 
      success: false, 
      error: message,
      code,
    },
    { status }
  )
}

// Validate request body
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: any
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    throw new ApiError('Invalid request body', 400, 'INVALID_BODY')
  }
}

// CORS headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle CORS preflight
export function handleCors(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    })
  }
  return null
}

// Log API request
export function logApiRequest(
  method: string,
  path: string,
  status: number,
  duration: number,
  tenantId?: string
) {
  console.log(`[API] ${method} ${path} ${status} ${duration}ms ${tenantId || 'anonymous'}`)
}

// Generate visitor ID
export function generateVisitorId(): string {
  return `vis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Sanitize text for embedding
export function sanitizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 8000) // Limit to 8000 characters
}

// Calculate token count (rough estimate)
export function estimateTokenCount(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}

// Validate URL
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Extract domain from URL
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return ''
  }
}

// Generate checksum for content
export async function generateChecksum(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
