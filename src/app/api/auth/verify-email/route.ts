import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { code, email } = await req.json()
    
    if (!code || !email) {
      return NextResponse.json({ error: 'Verification code and email are required' }, { status: 400 })
    }

    console.log('[verify-email] Verifying code:', { code: code.substring(0, 3) + '***', email })

    // Find the verification token in database by code
    const verificationToken = await db.emailVerificationToken.findFirst({
      where: { 
        token: code, // The code is stored as the token
        email: email.toLowerCase(),
        used: false,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    })

    if (!verificationToken) {
      console.log('[verify-email] Invalid or expired verification code')
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 })
    }

    // Mark token as used
    await db.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { used: true }
    })

    // Mark user as verified
    await db.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true }
    })

    console.log('[verify-email] Email verified successfully for user:', verificationToken.userId)

    return NextResponse.json({ 
      ok: true, 
      message: 'Email verified successfully',
      user: {
        id: verificationToken.user.id,
        email: verificationToken.user.email,
        name: verificationToken.user.name
      }
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
