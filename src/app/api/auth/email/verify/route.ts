import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmailVerification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await db.user.findFirst({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Delete any existing verification tokens for this user
    await db.emailVerificationToken.deleteMany({
      where: { userId: user.id }
    })

    // Create new verification token
    const verificationToken = `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    await db.emailVerificationToken.create({
      data: {
        userId: user.id,
        email: user.email,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    })

    // Send verification email
    try {
      const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const verificationUrl = `${origin}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`
      
      await sendEmailVerification(email, verificationUrl, user.name)
      
      console.log('Verification email sent successfully to:', email)
      
      return NextResponse.json({
        success: true,
        message: 'Verification email sent successfully',
        verifyUrl: verificationUrl
      })
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token and email are required' },
        { status: 400 }
      )
    }

    // Find verification token
    const verificationToken = await db.emailVerificationToken.findFirst({
      where: {
        token,
        email: email.toLowerCase(),
        used: false,
        expiresAt: { gt: new Date() }
      },
      include: {
        user: true
      }
    })

    if (!verificationToken) {
      // Check if token exists but is expired
      const expiredToken = await db.emailVerificationToken.findFirst({
        where: {
          token,
          email: email.toLowerCase(),
          used: false
        }
      })

      if (expiredToken && expiredToken.expiresAt <= new Date()) {
        return NextResponse.json(
          { error: 'Verification token has expired. Please request a new verification email.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Invalid verification token. Please check your email and try again.' },
        { status: 400 }
      )
    }

    // Mark token as used
    await db.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { used: true }
    })

    // Mark user email as verified
    await db.user.update({
      where: { id: verificationToken.user.id },
      data: { emailVerified: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: verificationToken.user.id,
        name: verificationToken.user.name,
        email: verificationToken.user.email,
        emailVerified: true
      }
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


