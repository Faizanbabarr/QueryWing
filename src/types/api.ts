import { z } from 'zod'

// Chat API Types
export const ChatMessageSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1),
  metadata: z.object({
    url: z.string().optional(),
    ua: z.string().optional(),
  }).optional(),
})

export const ChatResponseSchema = z.object({
  role: z.enum(['assistant', 'system']),
  content: z.string(),
  citations: z.array(z.object({
    title: z.string(),
    url: z.string(),
    snippet: z.string(),
  })).optional(),
})

export type ChatMessage = z.infer<typeof ChatMessageSchema>
export type ChatResponse = z.infer<typeof ChatResponseSchema>

// Lead API Types
export const LeadSchema = z.object({
  conversationId: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  consent: z.boolean(),
})

export type Lead = z.infer<typeof LeadSchema>

// Bot API Types
export const BotSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  instructions: z.string(),
  status: z.enum(['active', 'inactive', 'deleted']),
  publicKey: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  settings: z.object({
    theme: z.enum(['light', 'dark', 'auto']),
    position: z.string(),
    welcomeMessage: z.string(),
    leadCapture: z.boolean(),
    humanHandoff: z.boolean(),
    maxTokens: z.number(),
    temperature: z.number(),
    enableLiveAgents: z.boolean().optional(),
    transferPriority: z.enum(['fastest', 'cheapest']).optional(),
    transferTimeout: z.number().optional(),
    gdpr: z.boolean().optional(),
    dataRetention30Days: z.boolean().optional(),
  }),
  stats: z.object({
    conversations: z.number(),
    leads: z.number(),
    avgResponseTime: z.number(),
    satisfaction: z.number(),
  }),
})

export type Bot = z.infer<typeof BotSchema>

// Source API Types
export const SourceSchema = z.object({
  id: z.string(),
  type: z.enum(['upload', 'url', 'sitemap', 'notion', 'gdrive']),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  configJson: z.record(z.any()),
})

export type Source = z.infer<typeof SourceSchema>

// Document API Types
export const DocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().optional(),
  mime: z.string().optional(),
  size: z.number().optional(),
  checksum: z.string().optional(),
})

export type Document = z.infer<typeof DocumentSchema>

// Conversation API Types
export const ConversationSchema = z.object({
  id: z.string(),
  botId: z.string(),
  visitorId: z.string(),
  leadId: z.string().optional(),
  startedAt: z.date(),
  lastEventAt: z.date(),
})

export type Conversation = z.infer<typeof ConversationSchema>

// Message API Types
export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  role: z.enum(['user', 'assistant', 'system', 'agent']),
  content: z.string(),
  tokens: z.number().optional(),
  latencyMs: z.number().optional(),
  createdAt: z.date(),
})

export type Message = z.infer<typeof MessageSchema>

// Event API Types
export const EventSchema = z.object({
  type: z.string(),
  payloadJson: z.record(z.any()),
})

export type Event = z.infer<typeof EventSchema>

// Tenant API Types
export const TenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.string().optional(),
  plan: z.enum(['starter', 'growth', 'scale']),
  stripeCustomerId: z.string().optional(),
})

export type Tenant = z.infer<typeof TenantSchema>

// User API Types
export const UserSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  role: z.enum(['owner', 'admin', 'agent']),
  name: z.string(),
  email: z.string(),
  avatarUrl: z.string().optional(),
})

export type User = z.infer<typeof UserSchema>

// Analytics API Types
export const AnalyticsSchema = z.object({
  conversations: z.number(),
  leads: z.number(),
  deflectionRate: z.number(),
  avgLatency: z.number(),
  csatScore: z.number(),
  popularQuestions: z.array(z.object({
    question: z.string(),
    count: z.number(),
  })),
})

export type Analytics = z.infer<typeof AnalyticsSchema>

// Widget Configuration Types
export const WidgetConfigSchema = z.object({
  botId: z.string(),
  primary: z.string().optional(),
  position: z.enum(['bottom-right', 'bottom-left']).optional(),
  launcher: z.enum(['icon', 'button', 'custom']).optional(),
  gdpr: z.boolean().optional(),
  leadMode: z.enum(['always', 'on-intent', 'never']).optional(),
  collect: z.array(z.enum(['name', 'email', 'phone', 'company'])).optional(),
  playbook: z.enum(['lead', 'support', 'docs', 'custom']).optional(),
})

export type WidgetConfig = z.infer<typeof WidgetConfigSchema>

// API Response Types
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
})

export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
}

// Error Types
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// JWT Token Types
export interface JWTPayload {
  botId: string
  tenantId: string
  exp: number
  iat: number
}

// Rate Limiting Types
export interface RateLimitConfig {
  windowMs: number
  max: number
  message: string
}

// Cache Types
export interface CacheConfig {
  ttl: number
  key: string
}

// Embedding Types
export interface EmbeddingRequest {
  text: string
  model?: string
}

export interface EmbeddingResponse {
  embedding: number[]
  tokens: number
}

// Search Types
export interface SearchRequest {
  query: string
  botId: string
  limit?: number
  filters?: Record<string, any>
}

export interface SearchResult {
  id: string
  text: string
  score: number
  metadata: {
    title: string
    url?: string
    documentId: string
  }
}
