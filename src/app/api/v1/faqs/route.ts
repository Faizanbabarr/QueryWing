import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory FAQ store for demo
// @ts-ignore
const faqStore: { id: string; question: string; answer: string; updatedAt: string }[] = globalThis.__querywing_faqs || (globalThis.__querywing_faqs = [])

const json = (data: any, status = 200) => NextResponse.json(data, { status })

export async function GET() {
  return json({ faqs: faqStore })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { question, answer } = body || {}
    if (!question || !answer) return json({ error: 'question and answer required' }, 400)
    const id = 'faq_' + Date.now()
    faqStore.push({ id, question, answer, updatedAt: new Date().toISOString() })
    return json({ ok: true, id })
  } catch {
    return json({ error: 'failed to add faq' }, 500)
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return json({ error: 'id required' }, 400)
  const idx = faqStore.findIndex(f => f.id === id)
  if (idx === -1) return json({ error: 'not found' }, 404)
  faqStore.splice(idx, 1)
  return json({ ok: true })
}


