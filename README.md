<<<<<<< HEAD
# QueryWing
AN AI Chatbot 
=======
# QueryWing - AI Website Assistant

QueryWing turns your website into a 24/7 assistant that knows your docs, captures warm leads, and hands complex chats to humans.

## 🚀 Features

- **Smart AI Answers**: RAG-powered responses from your content
- **Lead Capture**: Intelligent forms that convert visitors
- **Human Handoff**: Seamless transfer to your team
- **Easy Setup**: One-line script embed
- **Multi-tenant SaaS**: Stripe billing, usage limits, roles
- **Analytics**: Track conversations, CSAT, leads, deflection rates
- **GDPR Compliant**: Built-in privacy controls

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS
- **Backend**: Node.js, Fastify, tRPC
- **Database**: PostgreSQL 15 + pgvector
- **Vector Search**: OpenAI embeddings + pgvector
- **Auth**: Clerk
- **Payments**: Stripe
- **Widget**: Vanilla TypeScript, <30kb gzipped

## 📦 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/your-org/querywing.git
cd querywing
npm install
```

### 2. Environment Setup

Copy the example environment file and fill in your values:

```bash
cp env.example .env.local
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/querywing"

# OpenAI
OPENAI_API_KEY="sk-proj-your-openai-key"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your-clerk-publishable"
CLERK_SECRET_KEY="sk_test_REDACTED-clerk-secret"

# Stripe
STRIPE_SECRET_KEY="sk_live_your-stripe-secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your-stripe-publishable"

# JWT
JWT_SECRET="generate-64b-secret-key-here"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Run migrations
npm run db:migrate
```

### 4. Build Widget

```bash
# Build the widget SDK
npm run widget:build
```

### 5. Start Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🎯 Usage

### Adding the Widget to Your Website

Add this one line to your HTML:

```html
<script async src="https://cdn.querywing.com/widget.js" data-bot-id="YOUR_BOT_PUBLIC_KEY"></script>
```

### Widget Configuration

```html
<script 
  async 
  src="https://cdn.querywing.com/widget.js" 
  data-bot-id="QW_PUBLIC_KEY"
  data-primary="#6E44FF"
  data-position="bottom-right"
  data-launcher="icon"
  data-gdpr="true"
  data-lead-mode="on-intent"
  data-collect="name,email,phone,company"
  data-playbook="support">
</script>
```

### Manual Initialization

```javascript
import { QueryWingWidget } from '@querywing/widget'

const widget = new QueryWingWidget({
  botId: 'your-bot-id',
  primary: '#6E44FF',
  position: 'bottom-right',
  leadMode: 'on-intent',
  collect: ['name', 'email']
})

// Listen to events
widget.on('opened', () => console.log('Widget opened'))
widget.on('message', (message) => console.log('New message:', message))
widget.on('lead', (lead) => console.log('Lead captured:', lead))
```

## 🏗️ Project Structure

```
querywing/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   │   └── v1/         # Public API endpoints
│   │   ├── dashboard/      # Admin dashboard
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   └── dashboard/     # Dashboard components
│   ├── lib/               # Utilities and helpers
│   ├── types/             # TypeScript type definitions
│   └── hooks/             # Custom React hooks
├── packages/
│   └── widget/            # Widget SDK
│       ├── src/           # Widget source code
│       └── dist/          # Built widget files
├── prisma/                # Database schema and migrations
└── public/                # Static assets
```

## 🔌 API Endpoints

### Chat API

```typescript
POST /api/v1/chat
Content-Type: application/json
Authorization: Bearer <signed-token>

{
  "message": "How do I reset my password?",
  "conversationId": "optional-existing-conversation-id",
  "metadata": {
    "url": "https://example.com/help",
    "ua": "Mozilla/5.0..."
  }
}
```

### Lead API

```typescript
POST /api/v1/lead
Content-Type: application/json
Authorization: Bearer <signed-token>

{
  "conversationId": "conversation-id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "consent": true
}
```

## 🎨 Customization

### Widget Styling

The widget uses CSS custom properties for easy theming:

```css
.qw-widget {
  --qw-primary: #6E44FF;
  --qw-primary-contrast: #fff;
  --qw-bg: #ffffff;
  --qw-panel: #f8fafc;
  --qw-text: #0f172a;
  --qw-muted: #64748b;
  --qw-radius: 14px;
  --qw-shadow: 0 8px 30px rgba(15,23,42,.08);
}
```

### Bot Configuration

Configure your bot's personality and behavior:

```typescript
const bot = {
  name: "Support Assistant",
  instructions: "You are a helpful customer support assistant...",
  temperature: 0.7,
  topP: 0.9,
  retrievalMode: "hybrid", // hybrid, vector, keyword
  published: true
}
```

## 📊 Analytics

Track key metrics:

- **Conversations**: Total chat sessions
- **Leads**: Captured contact information
- **Deflection Rate**: % of issues resolved without human intervention
- **CSAT Score**: Customer satisfaction ratings
- **Popular Questions**: Most asked questions
- **Response Time**: Average latency

## 🔒 Security & Privacy

- **Multi-tenant isolation**: Row-level security by tenant
- **JWT tokens**: Short-lived signed tokens for widget authentication
- **PII protection**: Automatic redaction in logs
- **GDPR compliance**: Data export/delete endpoints
- **Rate limiting**: Per-bot request limits

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
vercel --prod
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
OPENAI_API_KEY=sk-proj-...
STRIPE_SECRET_KEY=sk_live_...
CLERK_SECRET_KEY=sk_test_...
JWT_SECRET=your-64-char-secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.querywing.com](https://docs.querywing.com)
- **Status**: [status.querywing.com](https://status.querywing.com)
- **Email**: support@querywing.com
- **Discord**: [Join our community](https://discord.gg/querywing)

## 🗺️ Roadmap

- [ ] Advanced vector search with reranking
- [ ] Multi-language support
- [ ] Voice chat integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app for agents
- [ ] Webhook integrations (Zapier, Make)
- [ ] Custom AI models support
- [ ] Advanced conversation routing

---

Built with ❤️ by the QueryWing team
>>>>>>> ac633cc4 (Initial deploy)
