import { db } from '@/lib/db'

export async function getRelevantChunks(query: string, limit = 6): Promise<string[]> {
  const q = query.toLowerCase().slice(0, 200)
  try {
    const docs = await db.document.findMany({
      include: { chunks: true },
      orderBy: { createdAt: 'desc' },
      take: 25
    })

    const scored: { text: string; score: number }[] = []
    for (const d of docs) {
      for (const c of d.chunks as any[]) {
        const text = (c.content || c.text || '') as string
        if (!text) continue
        const t = text.toLowerCase()
        let score = 0
        // naive term overlap
        q.split(/[^a-z0-9]+/).filter(Boolean).forEach(w => {
          if (t.includes(w)) score += 1
        })
        if (score > 0) scored.push({ text, score })
      }
    }
    scored.sort((a,b) => b.score - a.score)
    return scored.slice(0, limit).map(s => s.text)
  } catch (e) {
    return []
  }
}


