import { db } from './db'

export async function initializeDatabase() {
  try {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('init-db is only available in development')
    }
    // Create a demo tenant with starter plan limits
    const tenant = await db.tenant.upsert({
      where: { id: 'demo-tenant' },
      update: {
        plan: 'starter',
        botCredits: 200, // 200 messages per month (starter plan limit)
        maxBots: 1,
        maxLiveAgents: 1,
      },
      create: {
        id: 'demo-tenant',
        name: 'Demo Company',
        domain: 'demo.querywing.com',
        plan: 'starter',
        botCredits: 200, // 200 messages per month (starter plan limit)
        maxBots: 1,
        maxLiveAgents: 1,
        settings: {}
      }
    })

    // Create a demo user
    const user = await db.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: 'demo@querywing.com' } },
      update: {},
      create: {
        tenantId: tenant.id,
        name: 'Demo User',
        email: 'demo@querywing.com',
        role: 'admin'
      }
    })

    // Create a demo bot
    const bot = await db.bot.upsert({
      where: { publicKey: 'demo-bot-key' },
      update: {},
      create: {
        tenantId: tenant.id,
        name: 'QueryWing Assistant',
        instructions: `You are QueryWing, an advanced AI website assistant that helps customers with product information, support, and sales inquiries. You are knowledgeable about:

**Product Features:**
- AI-powered chat widget that understands website content
- Lead capture and CRM integration
- Human handoff capabilities
- Multi-language support
- Analytics and reporting
- GDPR compliance
- One-line installation

**Pricing:**
- Starter: Free tier with basic features
- Growth: $99/month for growing teams
- Scale: Custom pricing for enterprises

**Technical Details:**
- Built with Next.js, TypeScript, and OpenAI
- Vector search for content retrieval
- Real-time streaming responses
- Customizable widget design
- Webhook integrations

**Best Practices:**
- Be helpful, professional, and concise
- Ask clarifying questions when needed
- Provide specific, actionable answers
- Offer to connect with sales for pricing/demo requests
- Suggest relevant features based on user needs

Always maintain a friendly, professional tone and focus on helping users understand how QueryWing can solve their customer support and lead generation challenges.`,
        temperature: 0.7,
        topP: 0.9,
        retrievalMode: 'hybrid',
        published: true,
        publicKey: 'demo-bot-key'
      }
    })

    // Create some demo conversations
    const conversations = await Promise.all([
      db.conversation.upsert({
        where: { id: 'demo-conv-1' },
        update: {},
        create: {
          id: 'demo-conv-1',
          botId: bot.id,
          visitorId: 'visitor-1',
          // startedAt field removed as it doesn't exist in schema
        }
      }),
      db.conversation.upsert({
        where: { id: 'demo-conv-2' },
        update: {},
        create: {
          id: 'demo-conv-2',
          botId: bot.id,
          visitorId: 'visitor-2',
          // startedAt field removed as it doesn't exist in schema
        }
      }),
      db.conversation.upsert({
        where: { id: 'demo-conv-3' },
        update: {},
        create: {
          id: 'demo-conv-3',
          botId: bot.id,
          visitorId: 'visitor-3',
          // startedAt field removed as it doesn't exist in schema
        }
      })
    ])

    // Create demo messages for conversations
    await Promise.all([
      // Conversation 1 messages
      db.message.createMany({
        data: [
          {
            conversationId: 'demo-conv-1',
            role: 'user',
            content: 'What are your pricing plans?',
            tokens: 8,
            createdAt: new Date(Date.now() - 1000 * 60 * 30)
          },
          {
            conversationId: 'demo-conv-1',
            role: 'assistant',
            content: 'We offer three pricing tiers:\n\n**Starter (Free):**\n- Basic chat widget\n- Up to 100 conversations/month\n- Email support\n\n**Growth ($99/month):**\n- Advanced AI responses\n- Unlimited conversations\n- Lead capture\n- Analytics dashboard\n- Priority support\n\n**Scale (Custom):**\n- Enterprise features\n- Custom integrations\n- Dedicated support\n- SLA guarantees\n\nWould you like me to help you choose the right plan for your needs?',
            tokens: 120,
            latencyMs: 1500,
            createdAt: new Date(Date.now() - 1000 * 60 * 29)
          }
        ],
        skipDuplicates: true
      }),

      // Conversation 2 messages
      db.message.createMany({
        data: [
          {
            conversationId: 'demo-conv-2',
            role: 'user',
            content: 'How do I integrate the widget?',
            tokens: 9,
            createdAt: new Date(Date.now() - 1000 * 60 * 15)
          },
          {
            conversationId: 'demo-conv-2',
            role: 'assistant',
            content: 'Integrating QueryWing is super simple! Just add this one line of code to your website:\n\n```html\n<script async src="https://cdn.querywing.com/widget.js" data-bot-id="YOUR_BOT_ID"></script>\n```\n\n**Steps:**\n1. Get your bot ID from the dashboard\n2. Add the script tag to your HTML\n3. That\'s it! The widget will appear automatically\n\n**Customization options:**\n- `data-primary="#6E44FF"` - Change primary color\n- `data-position="bottom-right"` - Change position\n- `data-lead-mode="on-intent"` - Lead capture settings\n\nWould you like me to show you how to customize the appearance?',
            tokens: 180,
            latencyMs: 1200,
            createdAt: new Date(Date.now() - 1000 * 60 * 14)
          }
        ],
        skipDuplicates: true
      }),

      // Conversation 3 messages (active)
      db.message.createMany({
        data: [
          {
            conversationId: 'demo-conv-3',
            role: 'user',
            content: 'Can I customize the widget design?',
            tokens: 10,
            createdAt: new Date(Date.now() - 1000 * 60 * 5)
          },
          {
            conversationId: 'demo-conv-3',
            role: 'assistant',
            content: 'Absolutely! QueryWing offers extensive customization options:\n\n**Visual Customization:**\n- Primary color (`data-primary="#6E44FF"`)\n- Position (`data-position="bottom-right"`)\n- Widget size and shape\n- Custom branding and logos\n\n**Behavior Customization:**\n- Welcome messages\n- Lead capture forms\n- Handoff triggers\n- Response templates\n\n**Advanced Features:**\n- Custom CSS for complete styling control\n- Webhook integrations\n- Multi-language support\n- A/B testing capabilities\n\nYou can configure all of these from your dashboard. Would you like me to walk you through the customization process?',
            tokens: 160,
            latencyMs: 1800,
            createdAt: new Date(Date.now() - 1000 * 60 * 4)
          }
        ],
        skipDuplicates: true
      })
    ])

    // Create some demo leads
    await Promise.all([
      db.lead.upsert({
        where: { id: 'demo-lead-1' },
        update: {},
        create: {
          id: 'demo-lead-1',
          tenantId: tenant.id,
          conversationId: 'demo-conv-1',
          name: 'John Smith',
          email: 'john@example.com',
          company: 'Tech Corp',
          tags: ['pricing', 'interested'],
          createdAt: new Date(Date.now() - 1000 * 60 * 25)
        }
      }),
      db.lead.upsert({
        where: { id: 'demo-lead-2' },
        update: {},
        create: {
          id: 'demo-lead-2',
          tenantId: tenant.id,
          conversationId: 'demo-conv-2',
          name: 'Sarah Johnson',
          email: 'sarah@startup.io',
          company: 'Startup Inc',
          tags: ['integration', 'technical'],
          createdAt: new Date(Date.now() - 1000 * 60 * 10)
        }
      })
    ])

    console.log('✅ Database initialized with demo data')
    return { tenant, user, bot, conversations }
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    throw error
  }
}
