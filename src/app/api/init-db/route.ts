import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Clean up any existing demo data first
    await cleanupExistingDemoData()

    // Create demo tenant
    const tenant = await db.tenant.upsert({
      where: { id: 'demo-tenant' },
      update: {
        plan: 'starter',
        botCredits: 200, // 200 message credits (starter plan)
        maxBots: 1, // Up to 1 bot (starter plan)
        maxLiveAgents: 1, // Up to 1 live agent (starter plan)
      },
      create: {
        id: 'demo-tenant',
        name: 'QueryWing Demo',
        domain: 'demo.querywing.com',
        plan: 'starter',
        botCredits: 200, // 200 message credits (starter plan)
        maxBots: 1, // Up to 1 bot (starter plan)
        maxLiveAgents: 1, // Up to 1 live agent (starter plan)
        settings: {
          features: ['chat', 'leads', 'analytics', 'live-chat'],
          branding: {
            primaryColor: '#6366f1',
            logo: null
          }
        }
      }
    })

    // Create demo bot (starter plan allows only 1)
    const bot1 = await db.bot.upsert({
      where: { id: 'demo-bot-1' },
      update: {},
      create: {
        id: 'demo-bot-1',
        tenantId: tenant.id,
        name: 'QueryWing Assistant',
        description: 'AI-powered customer support and sales assistant',
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
        status: 'active',
        published: true,
        publicKey: 'demo-bot-1-key'
      }
    })

    // Create demo users
    const user1 = await db.user.upsert({
      where: { id: 'demo-user-1' },
      update: {},
      create: {
        id: 'demo-user-1',
        tenantId: tenant.id,
        role: 'admin',
        name: 'John Smith',
        email: 'john@demo.querywing.com',
        emailVerified: true,
        notificationPreferences: {
          email: true,
          browser: true,
          leads: true,
          conversations: true,
          weeklyReports: false
        }
      }
    })

    const user2 = await db.user.upsert({
      where: { id: 'demo-user-2' },
      update: {},
      create: {
        id: 'demo-user-2',
        tenantId: tenant.id,
        role: 'agent',
        name: 'Sarah Johnson',
        email: 'sarah@demo.querywing.com',
        emailVerified: true,
        notificationPreferences: {
          email: true,
          browser: false,
          leads: true,
          conversations: false,
          weeklyReports: true
        }
      }
    })

    // Create demo live agent (starter plan allows only 1)
    const liveAgent1 = await db.liveAgent.upsert({
      where: { id: 'demo-agent-1' },
      update: {},
      create: {
        id: 'demo-agent-1',
        tenantId: tenant.id,
        userId: user1.id,
        name: 'John Smith',
        email: 'john@demo.querywing.com',
        status: 'available',
        hourlyRate: 40.0,
        isActive: true
      }
    })

    // Create demo conversations
    const conversation1 = await db.conversation.upsert({
      where: { id: 'demo-conv-1' },
      update: {},
      create: {
        id: 'demo-conv-1',
        botId: bot1.id,
        visitorId: 'visitor-1',
        status: 'active'
      }
    })

    const conversation2 = await db.conversation.upsert({
      where: { id: 'demo-conv-2' },
      update: {},
      create: {
        id: 'demo-conv-2',
        botId: bot1.id,
        visitorId: 'visitor-2',
        status: 'active'
      }
    })

    const conversation3 = await db.conversation.upsert({
      where: { id: 'demo-conv-3' },
      update: {},
      create: {
        id: 'demo-conv-3',
        botId: bot1.id,
        visitorId: 'visitor-3',
        status: 'active'
      }
    })

    // Create realistic demo leads with more details
    const lead1 = await db.lead.upsert({
      where: { id: 'demo-lead-1' },
      update: {},
      create: {
        id: 'demo-lead-1',
        tenantId: tenant.id,
        conversationId: conversation1.id,
        name: 'Alex Rodriguez',
        email: 'alex.rodriguez@innovatech.com',
        phone: '+1-415-555-0123',
        company: 'InnovaTech Solutions',
        status: 'contacted',
        source: 'Customer Support Bot',
        tags: ['enterprise', 'saas', 'tech', 'california'],
        notes: 'CTO at InnovaTech. Looking for AI-powered customer support solution. Company has 200+ employees. Budget: $50K-100K annually. Interested in enterprise features like SSO, API access, and custom integrations. Follow-up scheduled for next week.',
        botId: bot1.id
      }
    })

    const lead2 = await db.lead.upsert({
      where: { id: 'demo-lead-2' },
      update: {},
      create: {
        id: 'demo-lead-2',
        tenantId: tenant.id,
        conversationId: conversation2.id,
        name: 'Sarah Chen',
        email: 'sarah.chen@startupflow.io',
        phone: '+1-212-555-0456',
        company: 'StartupFlow',
        status: 'qualified',
        source: 'QueryWing Assistant',
        tags: ['startup', 'fintech', 'new-york', 'series-a'],
        notes: 'Founder of fintech startup. Currently in Series A funding round. Team of 15 people. Need chatbot for customer onboarding and support. Budget: $10K-25K annually. Very interested in AI capabilities and easy integration.',
        botId: bot1.id
      }
    })

    const lead3 = await db.lead.upsert({
      where: { id: 'demo-lead-3' },
      update: {},
      create: {
        id: 'demo-lead-3',
        tenantId: tenant.id,
        conversationId: conversation3.id,
        name: 'Marcus Johnson',
        email: 'marcus.johnson@ecompros.com',
        phone: '+1-305-555-0789',
        company: 'EcomPros',
        status: 'new',
        source: 'QueryWing Assistant',
        tags: ['ecommerce', 'retail', 'florida', 'growth'],
        notes: 'E-commerce business owner. Sells electronics and accessories. Website gets 50K+ monthly visitors. Current customer support overwhelmed. Looking for 24/7 automated support solution. Budget: $5K-15K annually.',
        botId: bot1.id
      }
    })

    // Create demo messages for conversations
    const message1 = await db.message.upsert({
      where: { id: 'demo-msg-1' },
      update: {},
      create: {
        id: 'demo-msg-1',
        conversationId: conversation1.id,
        role: 'user',
        content: 'Hi, I need help with your customer support solution. Can you tell me more about the features?'
      }
    })

    const message2 = await db.message.upsert({
      where: { id: 'demo-msg-2' },
      update: {},
      create: {
        id: 'demo-msg-2',
        conversationId: conversation1.id,
        role: 'assistant',
        content: 'Hello! I\'d be happy to help you with our customer support solution. We offer AI-powered chatbots that can handle common inquiries, 24/7 availability, and seamless human handoff. What specific features are you interested in?'
      }
    })

    const message3 = await db.message.upsert({
      where: { id: 'demo-msg-3' },
      update: {},
      create: {
        id: 'demo-msg-3',
        conversationId: conversation2.id,
        role: 'user',
        content: 'What are your pricing plans? We\'re a startup looking for a sales assistant bot.'
      }
    })

    const message4 = await db.message.upsert({
      where: { id: 'demo-msg-4' },
      update: {},
      create: {
        id: 'demo-msg-4',
        conversationId: conversation2.id,
        role: 'assistant',
        content: 'Great choice! For startups, we recommend our Growth plan at $99/month. It includes unlimited conversations, lead capture, and basic analytics. Would you like me to schedule a demo to show you how it works?'
      }
    })

    const message5 = await db.message.upsert({
      where: { id: 'demo-msg-5' },
      update: {},
      create: {
        id: 'demo-msg-5',
        conversationId: conversation3.id,
        role: 'user',
        content: 'How do I set up the product guide bot on my website?'
      }
    })

    const message6 = await db.message.upsert({
      where: { id: 'demo-msg-6' },
      update: {},
      create: {
        id: 'demo-msg-6',
        conversationId: conversation3.id,
        role: 'assistant',
        content: 'Setting up is super easy! Just add one line of JavaScript to your website. I\'ll generate the exact code for you. Do you want me to walk you through the setup process?'
      }
    })

    // Create demo analytics data
    const analytics1 = await db.analytics.create({
      data: {
        tenantId: tenant.id,
        type: 'chat_started',
        visitorId: 'visitor-1',
        botId: bot1.id,
        metadata: {
          page: '/support',
          referrer: 'google.com'
        }
      }
    })

    const analytics2 = await db.analytics.create({
      data: {
        tenantId: tenant.id,
        type: 'lead_captured',
        visitorId: 'visitor-2',
        botId: bot1.id,
        metadata: {
          conversationId: conversation2.id,
          leadSource: 'querywing-assistant'
        }
      }
    })

    const analytics3 = await db.analytics.create({
      data: {
        tenantId: tenant.id,
        type: 'message_sent',
        visitorId: 'visitor-3',
        botId: bot1.id,
        metadata: {
          messageLength: 45,
          conversationId: conversation3.id
        }
      }
    })

    // Create demo live chat request
    const liveChatRequest = await db.liveChatRequest.create({
      data: {
        tenantId: tenant.id,
        conversationId: conversation1.id,
        status: 'pending',
        priority: 'normal',
        issue: 'Customer needs technical support with integration'
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized with starter plan demo data',
      data: {
        tenant: tenant.id,
        bots: [bot1.id],
        users: [user1.id, user2.id],
        liveAgents: [liveAgent1.id],
        conversations: [conversation1.id, conversation2.id, conversation3.id],
        leads: [lead1.id, lead2.id, lead3.id],
        messages: [message1.id, message2.id, message3.id, message4.id, message5.id, message6.id],
        analytics: [analytics1.id, analytics2.id, analytics3.id],
        liveChatRequest: liveChatRequest.id
      }
    })

  } catch (error) {
    console.error('Error initializing database:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database', details: error },
      { status: 500 }
    )
  }
}

async function cleanupExistingDemoData() {
  try {
    // Delete in reverse order to respect foreign key constraints
    await db.analytics.deleteMany({
      where: {
        tenantId: 'demo-tenant'
      }
    })

    await db.botCreditUsage.deleteMany({
      where: {
        tenantId: 'demo-tenant'
      }
    })

    await db.liveChatRequest.deleteMany({
      where: {
        tenantId: 'demo-tenant'
      }
    })

    await db.liveAgent.deleteMany({
      where: {
        id: {
          in: ['demo-agent-1']
        }
      }
    })

    await db.message.deleteMany({
      where: {
        conversationId: {
          in: ['demo-conv-1', 'demo-conv-2', 'demo-conv-3']
        }
      }
    })

    await db.lead.deleteMany({
      where: {
        id: {
          in: ['demo-lead-1', 'demo-lead-2', 'demo-lead-3']
        }
      }
    })

    await db.conversation.deleteMany({
      where: {
        id: {
          in: ['demo-conv-1', 'demo-conv-2', 'demo-conv-3']
        }
      }
    })

    await db.bot.deleteMany({
      where: {
        id: {
          in: ['demo-bot-1']
        }
      }
    })

    await db.user.deleteMany({
      where: {
        id: {
          in: ['demo-user-1', 'demo-user-2']
        }
      }
    })

    await db.tenant.deleteMany({
      where: {
        id: 'demo-tenant'
      }
    })

    console.log('Existing demo data cleaned up successfully')
  } catch (error) {
    console.error('Error cleaning up existing demo data:', error)
  }
}
