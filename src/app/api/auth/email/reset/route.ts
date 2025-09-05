import { NextRequest, NextResponse } from 'next/server'
import { sendPasswordResetEmail, buildAppOrigin } from '@/lib/email'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Check if user exists
    const user = await db.user.findFirst({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email address' }, { status: 404 })
    }

    // Create a secure reset token
    const token = 'rst-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    const origin = buildAppOrigin(req)
    const resetUrl = `${origin}/auth/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`

    // Store reset token in database with longer expiration (24 hours instead of 15 minutes)
    await db.emailVerificationToken.create({
      data: {
        userId: user.id,
        email: user.email,
        token: token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    })

    try {
      // Send the password reset email
      const emailResult = await sendPasswordResetEmail(email, resetUrl, user.name)
      
      console.log('Password reset email sent successfully:', {
        to: email,
        token: token,
        emailId: emailResult.id
      })

      // Return success with token for client-side storage
      return NextResponse.json({ 
        ok: true, 
        message: 'Password reset email sent successfully',
        token, 
        email,
        // Don't return the full URL in production for security
        resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
      })

    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      
      // In development, still return success but log the error
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 [DEV] Password reset would be sent to:', email)
        console.log('📧 [DEV] Reset URL:', resetUrl)
        
        return NextResponse.json({ 
          ok: true, 
          message: 'Password reset email logged to console (development mode)',
          token, 
          email,
          resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
        })
      }
      
      return NextResponse.json({ 
        error: 'Failed to send password reset email. Please try again later.' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Password reset API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error. Please try again later.' 
    }, { status: 500 })
  }
}


