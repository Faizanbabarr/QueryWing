export async function sendEmailViaResend(params: {
  apiKey?: string | null
  to: string
  subject: string
  html: string
  from?: string
}) {
  const { apiKey = process.env.RESEND_API_KEY, to, subject, html, from } = params
  
  // Enhanced debug environment variables
  console.log('[email:debug] Environment check:', {
    RESEND_API_KEY: process.env.RESEND_API_KEY ? `SET (${process.env.RESEND_API_KEY.substring(0, 10)}...)` : 'NOT SET',
    RESEND_FROM: process.env.RESEND_FROM ? 'SET' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
    providedApiKey: apiKey ? `PROVIDED (${apiKey.substring(0, 10)}...)` : 'NOT PROVIDED',
    processEnvKeys: Object.keys(process.env).filter(key => key.includes('RESEND'))
  })
  
  // If no API key, try to send via a fallback service or log for development
  if (!apiKey) {
    console.log('[email:mock]', { to, subject, html })
    
    // For development, we can simulate email sending
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 [DEV] Email would be sent to:', to)
      console.log('📧 [DEV] Subject:', subject)
      console.log('📧 [DEV] Content:', html)
      
      // Simulate email delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return { ok: true, id: 'dev-mock', message: 'Email logged to console (development mode)' }
    }
    
    throw new Error('No email service configured. Please set RESEND_API_KEY environment variable.')
  }

  try {
    console.log('[email:resend] Attempting to send email via Resend API...')
    
    // Use verified email address for Resend free tier
    const fromEmail = from || process.env.RESEND_FROM || 'faizanbabar366@gmail.com'
    
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html
      })
    })

    console.log('[email:resend] Response status:', res.status)

    if (!res.ok) {
      const err = await res.text()
      console.error('[email:resend] API error response:', err)
      
      // Handle Resend free tier limitations
      if (res.status === 403 && err.includes('You can only send testing emails to your own email address')) {
        console.log('[email:resend] Resend free tier limitation - falling back to development mode')
        
        if (process.env.NODE_ENV === 'development') {
          console.log('📧 [DEV] Resend free tier limitation - email logged to console')
          console.log('📧 [DEV] To:', to)
          console.log('📧 [DEV] Subject:', subject)
          console.log('📧 [DEV] Content:', html)
          
          await new Promise(resolve => setTimeout(resolve, 1000))
          return { ok: true, id: 'dev-mock-resend-limit', message: 'Email logged due to Resend free tier limitation' }
        }
      }
      
      throw new Error(`Resend API error: ${res.status} - ${err}`)
    }
    
    const data = await res.json()
    console.log('[email:resend] Success response:', data)
    return data
  } catch (error) {
    console.error('[email:resend] Failed to send email via Resend:', error)
    
    // In development, fall back to mock mode
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 [DEV] Falling back to mock mode due to Resend error')
      console.log('📧 [DEV] Email would be sent to:', to)
      console.log('📧 [DEV] Subject:', subject)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { ok: true, id: 'dev-mock-fallback', message: 'Email logged to console (fallback mode)' }
    }
    
    throw error
  }
}

export async function sendEmailViaMailgun(params: {
  apiKey?: string | null
  domain?: string | null
  to: string
  subject: string
  html: string
  from?: string
}) {
  const { 
    apiKey = process.env.MAILGUN_API_KEY, 
    domain = process.env.MAILGUN_DOMAIN,
    to, 
    subject, 
    html, 
    from = process.env.MAILGUN_FROM || `noreply@${domain}` 
  } = params
  
  console.log('[email:mailgun] Environment check:', {
    MAILGUN_API_KEY: process.env.MAILGUN_API_KEY ? `SET (${process.env.MAILGUN_API_KEY.substring(0, 10)}...)` : 'NOT SET',
    MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN || 'NOT SET',
    MAILGUN_FROM: process.env.MAILGUN_FROM || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV
  })
  
  if (!apiKey || !domain) {
    console.log('[email:mock]', { to, subject, html })
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 [DEV] Email would be sent via Mailgun to:', to)
      console.log('📧 [DEV] Subject:', subject)
      console.log('📧 [DEV] Content:', html)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { ok: true, id: 'dev-mock-mailgun', message: 'Email logged to console (development mode)' }
    }
    
    throw new Error('No Mailgun service configured. Please set MAILGUN_API_KEY and MAILGUN_DOMAIN environment variables.')
  }

  try {
    console.log('[email:mailgun] Attempting to send email via Mailgun API...')
    
    // Create form data for Mailgun
    const formData = new FormData()
    formData.append('from', from)
    formData.append('to', to)
    formData.append('subject', subject)
    formData.append('html', html)
    
    const res = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
      },
      body: formData
    })

    console.log('[email:mailgun] Response status:', res.status)

    if (!res.ok) {
      const err = await res.text()
      console.error('[email:mailgun] API error response:', err)
      throw new Error(`Mailgun API error: ${res.status} - ${err}`)
    }
    
    const data = await res.json()
    console.log('[email:mailgun] Success response:', data)
    return data
  } catch (error) {
    console.error('[email:mailgun] Failed to send email via Mailgun:', error)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 [DEV] Falling back to mock mode due to Mailgun error')
      console.log('📧 [DEV] Email would be sent to:', to)
      console.log('📧 [DEV] Subject:', subject)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { ok: true, id: 'dev-mock-mailgun-fallback', message: 'Email logged to console (fallback mode)' }
    }
    
    throw error
  }
}

// New function specifically for password reset emails
export async function sendPasswordResetEmail(email: string, resetUrl: string, userName?: string) {
  const subject = 'Reset your QueryWing password'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7C3AED 0%, #6366F1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hi${userName ? ` ${userName}` : ''},</p>
          
          <p>We received a request to reset your password for your QueryWing account.</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset My Password</a>
          </div>
          
          <p>If you didn't request this password reset, you can safely ignore this email.</p>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> This link will expire in 15 minutes for your security.
          </div>
          
          <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6366f1;">${resetUrl}</p>
        </div>
        
        <div class="footer">
          <p>Best regards,<br>The QueryWing Team</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject,
    html
  })
}

// Email verification function for new users
export async function sendEmailVerification(email: string, verificationUrl: string, userName?: string) {
  const subject = 'Verify your QueryWing email address'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7C3AED 0%, #6366F1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Verify Your Email</h1>
        </div>
        <div class="content">
          <p>Hi${userName ? ` ${userName}` : ''},</p>
          
          <p>Welcome to QueryWing! Please verify your email address to complete your registration.</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          
          <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6366f1;">${verificationUrl}</p>
          
          <p>This verification link will expire in 24 hours.</p>
        </div>
        
        <div class="footer">
          <p>Best regards,<br>The QueryWing Team</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject,
    html
  })
}

// Main email sending function that chooses the best available service
export async function sendEmail(params: {
  to: string
  subject: string
  html: string
  from?: string
}) {
  // Try Mailgun first (best free tier)
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    try {
      return await sendEmailViaMailgun(params)
    } catch (error) {
      console.log('[email] Mailgun failed, trying Resend...')
    }
  }

  // Try Resend next
  if (process.env.RESEND_API_KEY) {
    try {
      return await sendEmailViaResend(params)
    } catch (error) {
      console.log('[email] Resend failed, trying mock...')
    }
  }

  // Fallback to mock mode for development
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 [DEV] No email service available, using mock mode')
    console.log('📧 [DEV] Email would be sent to:', params.to)
    console.log('📧 [DEV] Subject:', params.subject)
    console.log('📧 [DEV] From:', params.from || process.env.RESEND_FROM || 'faizanbabar366@gmail.com')
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { ok: true, id: 'dev-mock-final', message: 'Email logged to console (final fallback)' }
  }

  throw new Error('No email service configured. Please set up Mailgun, Resend, or another email service.')
}

export function buildAppOrigin(req: Request): string {
  const url = new URL(req.url)
  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`
  return origin.replace(/\/$/, '')
}


