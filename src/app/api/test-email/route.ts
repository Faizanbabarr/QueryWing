import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Test environment variables
  const envCheck = {
    RESEND_API_KEY: process.env.RESEND_API_KEY ? 'SET' : 'NOT SET',
    RESEND_FROM: process.env.RESEND_FROM ? 'SET' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET'
  }

  // Test direct email sending
  let emailTest = 'NOT TESTED'
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: ['test@example.com'],
        subject: 'Test Email',
        html: '<p>This is a test email</p>'
      })
    })

    if (response.ok) {
      const data = await response.json()
      emailTest = `SUCCESS: ${JSON.stringify(data)}`
    } else {
      const error = await response.text()
      emailTest = `FAILED: ${response.status} - ${error}`
    }
  } catch (error) {
    emailTest = `ERROR: ${error instanceof Error ? error.message : String(error)}`
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: envCheck,
    emailTest,
    message: 'Email system test completed'
  })
}
