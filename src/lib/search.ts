import type { ReactNode } from 'react'

export type SearchKind = 'Jump to' | 'Projects' | 'Skills' | 'Links' | 'Actions'

export interface SearchItem {
  id: string
  kind: SearchKind
  title: string
  subtitle?: string
  /** Extra text that can match but is never highlighted. */
  keywords?: string
  icon: ReactNode
  run: () => void
}

export interface SearchResult {
  item: SearchItem
  indices: number[]
}

interface Match {
  score: number
  indices: number[]
}

const isBoundary = (text: string, i: number) => i === 0 || /[\s\-_/.]/.test(text[i - 1])

/** Substring match first, then a forgiving subsequence match ("atl" → "Atlas"). */
export function fuzzyMatch(query: string, text: string): Match | null {
  const q = query.trim().toLowerCase()
  const t = text.toLowerCase()
  if (!q) return { score: 0, indices: [] }

  const at = t.indexOf(q)
  if (at !== -1) {
    const indices = Array.from({ length: q.length }, (_, i) => at + i)
    return { score: 100 + q.length * 4 - at + (isBoundary(t, at) ? 40 : 0), indices }
  }

  const indices: number[] = []
  let score = 0
  let from = 0
  for (const ch of q) {
    if (ch === ' ') continue
    const found = t.indexOf(ch, from)
    if (found === -1) return null
    const consecutive = indices.length > 0 && found === indices[indices.length - 1] + 1
    score += consecutive ? 6 : isBoundary(t, found) ? 8 : 1
    score -= Math.min(found - from, 6) * 0.5
    indices.push(found)
    from = found + 1
  }
  return { score, indices }
}

export function rankItems(items: SearchItem[], query: string): SearchResult[] {
  if (!query.trim()) return items.map((item) => ({ item, indices: [] }))

  const ranked: (SearchResult & { score: number })[] = []
  for (const item of items) {
    const title = fuzzyMatch(query, item.title)
    if (title) {
      ranked.push({ item, indices: title.indices, score: title.score })
      continue
    }
    const extra = fuzzyMatch(query, `${item.subtitle ?? ''} ${item.keywords ?? ''}`)
    if (extra && extra.score > 10) ranked.push({ item, indices: [], score: extra.score * 0.5 })
  }
  return ranked.sort((a, b) => b.score - a.score).slice(0, 24)
}
