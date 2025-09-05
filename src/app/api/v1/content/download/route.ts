import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// fallback store
// @ts-ignore
const fallbackDocuments: any[] = globalThis.__querywing_fallbackDocuments || []

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  try {
    try {
      const doc = await db.document.findUnique({ where: { id } })
      if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      const content = doc.name || 'Document'
      return new NextResponse(content, { status: 200, headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${doc.name || 'document'}.txt"`
      }})
    } catch (e) {
      const doc = fallbackDocuments.find((d:any)=>d.id===id)
      if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      const content = doc.content || doc.name
      return new NextResponse(content, { status: 200, headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${doc.name || 'document'}.txt"`
      }})
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to download' }, { status: 500 })
  }
}


