import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await db.user.findFirst({
      where: { email: email.toLowerCase() },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            plan: true
          }
        },
        passwords: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if user has a password
    let isValidPassword = false
    
    if (user.passwords && user.passwords.length > 0) {
      // User has a password, verify it
      isValidPassword = await bcrypt.compare(password, user.passwords[0].hash)
    } else {
      // Demo user - use default password "password123"
      isValidPassword = password === 'password123'
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email address before logging in' },
        { status: 401 }
      )
    }

    // Create session token (in production, use JWT)
    const sessionToken = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Store session in database (7 day expiry)
    await db.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    // Return user data (without password)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tenant: user.tenant,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userData,
      sessionToken
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


