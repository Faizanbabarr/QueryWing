import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const { message, history = [], instructions = 'You are a helpful website assistant.', temperature = 0.7, maxTokens = 500, topP = 0.9 } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'OpenAI key not configured' }, { status: 500 })

    const openai = new OpenAI({ apiKey })

    const messages = [
      { role: 'system' as const, content: instructions },
      ...history.slice(-10).map((m: any) => ({ role: m.role === 'user' ? 'user' as const : 'assistant' as const, content: String(m.content || '') })),
      { role: 'user' as const, content: message }
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: Math.max(50, Math.min(2048, Math.floor(maxTokens))),
      temperature: Math.max(0, Math.min(2, temperature)),
      top_p: Math.max(0, Math.min(1, topP)),
    })

    const content = completion.choices[0]?.message?.content || 'I am ready to help.'
    return NextResponse.json({ content })
  } catch (e) {
    console.error('public-chat error', e)
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}


