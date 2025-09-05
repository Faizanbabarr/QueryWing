import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

function toCsvRow(values: (string | number | null | undefined)[]) {
  return values
    .map((v) => {
      const s = v == null ? '' : String(v)
      if (s.includes('"') || s.includes(',') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"'
      }
      return s
    })
    .join(',')
}

export async function GET() {
  try {
    // Try DB first
    try {
      const docs = await db.document.findMany({
        include: { source: true }
      })
      const header = toCsvRow(['id', 'name', 'type', 'status', 'size', 'url', 'uploadedAt', 'pages', 'words'])
      const rows = docs.map((d) =>
        toCsvRow([
          d.id,
          d.name,
          d.source?.type || 'document',
          'completed',
          '',
          d.source?.url || '',
          d.createdAt.toISOString(),
          '',
          ''
        ])
      )
      const csv = [header, ...rows].join('\n')
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="content_export.csv"'
        }
      })
    } catch (_) {
      // Fallback to in-memory
      // @ts-ignore
      const fallbackDocs = (globalThis as any).__querywing_fallbackDocuments || []
      const header = toCsvRow(['id', 'name', 'type', 'status', 'size', 'url', 'uploadedAt', 'pages', 'words'])
      const rows = fallbackDocs.map((d: any) =>
        toCsvRow([
          d.id,
          d.name,
          d.type,
          d.status,
          d.size || '',
          d.url || '',
          d.uploadedAt,
          d.pages || '',
          d.words || ''
        ])
      )
      const csv = [header, ...rows].join('\n')
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="content_export.csv"'
        }
      })
    }
  } catch (e) {
    return NextResponse.json({ error: 'Failed to export content' }, { status: 500 })
  }
}


