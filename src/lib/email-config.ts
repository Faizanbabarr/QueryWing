// Email Configuration Helper
// This file helps configure email services for QueryWing

export interface EmailConfig {
  provider: 'mailgun' | 'resend' | 'sendgrid' | 'nodemailer' | 'mock'
  apiKey?: string
  fromEmail?: string
  fromName?: string
}

export function getEmailConfig(): EmailConfig {
  // Check for Mailgun configuration first (best free tier)
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    return {
      provider: 'mailgun',
      apiKey: process.env.MAILGUN_API_KEY,
      fromEmail: process.env.MAILGUN_FROM || `noreply@${process.env.MAILGUN_DOMAIN}`,
      fromName: 'QueryWing'
    }
  }

  // Check for Resend configuration
  if (process.env.RESEND_API_KEY) {
    return {
      provider: 'resend',
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM || 'onboarding@resend.dev',
      fromName: 'QueryWing'
    }
  }

  // Check for SendGrid configuration
  if (process.env.SENDGRID_API_KEY) {
    return {
      provider: 'sendgrid',
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: process.env.SENDGRID_FROM || 'noreply@yourdomain.com',
      fromName: 'QueryWing'
    }
  }

  // Check for Nodemailer configuration
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return {
      provider: 'nodemailer',
      fromEmail: process.env.SMTP_FROM || process.env.SMTP_USER,
      fromName: 'QueryWing'
    }
  }

  // Fallback to mock mode for development
  return {
    provider: 'mock',
    fromEmail: 'noreply@querywing.dev',
    fromName: 'QueryWing (Mock)'
  }
}

export function getEmailSetupInstructions(): string {
  return `
📧 Email Service Setup Instructions

To enable real email sending in QueryWing, you need to configure one of these services:

🔫 MAILGUN (Best Free Tier - 5,000 emails/month for 3 months, then 100/day)
1. Sign up at https://mailgun.com
2. Get your API key and domain
3. Add to .env.local:
   MAILGUN_API_KEY=your_api_key_here
   MAILGUN_DOMAIN=your_domain.mailgun.org
   MAILGUN_FROM=noreply@your_domain.mailgun.org

🔑 RESEND (Good Free Tier - 100 emails/day)
1. Sign up at https://resend.com
2. Get your API key
3. Add to .env.local:
   RESEND_API_KEY=re_your_resend_api_key_here
   RESEND_FROM=your-verified-domain@example.com

📧 SENDGRID (Free Tier - 100 emails/day)
1. Sign up at https://sendgrid.com
2. Get your API key
3. Add to .env.local:
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   SENDGRID_FROM=your-verified-sender@example.com

📮 SMTP (Nodemailer)
1. Configure your SMTP server
2. Add to .env.local:
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=your-email@gmail.com

💡 For development, emails will be logged to the console.
💡 For production, configure at least one email service above.
💡 We recommend Mailgun for the best free tier.
  `.trim()
}

export function validateEmailConfig(): { valid: boolean; issues: string[] } {
  const config = getEmailConfig()
  const issues: string[] = []

  if (config.provider === 'mock') {
    issues.push('No email service configured - emails will be logged to console only')
  }

  if (config.provider === 'mailgun') {
    if (!process.env.MAILGUN_API_KEY) issues.push('MAILGUN_API_KEY is missing')
    if (!process.env.MAILGUN_DOMAIN) issues.push('MAILGUN_DOMAIN is missing')
  }

  if (config.provider === 'resend' && !config.apiKey) {
    issues.push('RESEND_API_KEY is missing')
  }

  if (config.provider === 'sendgrid' && !config.apiKey) {
    issues.push('SENDGRID_API_KEY is missing')
  }

  if (config.provider === 'nodemailer') {
    if (!process.env.SMTP_HOST) issues.push('SMTP_HOST is missing')
    if (!process.env.SMTP_USER) issues.push('SMTP_USER is missing')
    if (!process.env.SMTP_PASS) issues.push('SMTP_PASS is missing')
  }

  return {
    valid: issues.length === 0,
    issues
  }
}
