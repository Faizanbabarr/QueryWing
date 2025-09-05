import { NextRequest, NextResponse } from 'next/server'
import { getEmailConfig, validateEmailConfig } from '@/lib/email-config'
import { sendPasswordResetEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    const config = getEmailConfig()
    const validation = validateEmailConfig()
    
    return NextResponse.json({
      config,
      validation,
      environment: {
        RESEND_API_KEY: process.env.RESEND_API_KEY ? `SET (${process.env.RESEND_API_KEY.substring(0, 10)}...)` : 'NOT SET',
        RESEND_FROM: process.env.RESEND_FROM || 'NOT SET',
        NODE_ENV: process.env.NODE_ENV
      }
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Test sending a password reset email
    const result = await sendPasswordResetEmail(email, 'http://localhost:3000/test-reset')
    
    return NextResponse.json({
      success: true,
      result,
      config: getEmailConfig()
    })
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      config: getEmailConfig()
    }, { status: 500 })
  }
}
