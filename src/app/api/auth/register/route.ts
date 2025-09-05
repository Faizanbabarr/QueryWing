import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { sendEmailVerification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create or find tenant (for demo purposes, create a new one)
    let tenant = await db.tenant.findFirst({
      where: { name: 'Demo Tenant' }
    })

    if (!tenant) {
      tenant = await db.tenant.create({
        data: {
          name: 'Demo Tenant',
          plan: 'starter',
          settings: {
            theme: 'light',
            language: 'en'
          }
        }
      })
    }

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        role: 'admin',
        tenantId: tenant.id,
        emailVerified: false,
        notificationPreferences: {
          email: true,
          browser: true,
          leads: true,
          conversations: true,
          weeklyReports: false
        }
      }
    })

    // Create password hash in separate table
    await db.password.create({
      data: {
        userId: user.id,
        hash: hashedPassword
      }
    })

    // Create email verification token
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
      
      await sendEmailVerification(email, verificationUrl, name)
      
      console.log('Verification email sent successfully to:', email)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Don't fail registration if email fails
    }

    // Return user data (without password)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      user: userData
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


