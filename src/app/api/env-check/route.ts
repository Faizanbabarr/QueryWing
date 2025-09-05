import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      RESEND_API_KEY: process.env.RESEND_API_KEY ? 'SET' : 'NOT SET',
      RESEND_FROM: process.env.RESEND_FROM ? 'SET' : 'NOT SET',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? 'SET' : 'NOT SET'
    },
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('RESEND') || key.includes('DATABASE')),
    message: 'Environment variables check completed'
  })
}
