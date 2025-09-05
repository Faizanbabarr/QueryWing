import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    // Test email configuration
    const config = {
      resendApiKey: process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing',
      resendFrom: process.env.RESEND_FROM ? `✅ ${process.env.RESEND_FROM}` : '❌ Missing',
      databaseUrl: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
      openaiKey: process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'
    }

    // Test token creation (simulate what happens in password reset)
    let tokenTest = 'Not tested'
    try {
      const testToken = 'test-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
      const testExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      
      tokenTest = `✅ Token created: ${testToken.substring(0, 20)}... | Expires: ${testExpiration.toISOString()}`
    } catch (error) {
      tokenTest = `❌ Token test failed: ${error.message}`
    }

    // Test sending a simple email
    let emailResult = 'Not tested'
    try {
      await sendEmail({
        to: 'test@example.com',
        subject: 'Test Email from QueryWing',
        html: '<h1>Test Email</h1><p>This is a test email to verify your configuration.</p>'
      })
      emailResult = '✅ Email sent successfully'
    } catch (error) {
      emailResult = `❌ Email failed: ${error.message}`
    }

    return NextResponse.json({
      message: 'Email configuration test',
      config,
      tokenTest,
      emailTest: emailResult,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Email config test error:', error)
    return NextResponse.json(
      { error: 'Failed to test email configuration', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, html } = body

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      )
    }

    // Send test email
    const result = await sendEmail({
      to,
      subject,
      html
    })

    return NextResponse.json({
      message: 'Test email sent successfully',
      result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { error: 'Failed to send test email', details: error.message },
      { status: 500 }
    )
  }
}
