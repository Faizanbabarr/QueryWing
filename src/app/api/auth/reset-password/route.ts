import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, email, password } = await request.json()

    if (!token || !email || !password) {
      return NextResponse.json(
        { error: 'Token, email, and password are required' },
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

    // Find and validate reset token
    const resetToken = await db.emailVerificationToken.findFirst({
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

    if (!resetToken) {
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
          { error: 'Reset token has expired. Please request a new password reset email.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Invalid reset token. Please check your email and try again.' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password in the Password table
    // First, delete any existing passwords for this user
    await db.password.deleteMany({
      where: { userId: resetToken.user.id }
    })

    // Create new password hash
    await db.password.create({
      data: {
        userId: resetToken.user.id,
        hash: hashedPassword
      }
    })

    // Mark token as used
    await db.emailVerificationToken.update({
      where: { id: resetToken.id },
      data: { used: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
