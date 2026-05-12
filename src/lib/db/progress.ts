import { prisma } from '@/lib/prisma'

export async function getUserProgress(username: string, topiccode?: string) {
  const where: Record<string, unknown> = { username }
  if (topiccode) where.topiccode = topiccode
  return prisma.tblProgress.findMany({ where })
}

export async function getProgressWithContent(username: string) {
  const progress = await prisma.tblProgress.findMany({
    where: { username, corrects: { gte: '2' } },
  })
  const allContent = await prisma.tblContent.findMany()
  const contentMap = new Map(allContent.map((c) => [`${c.topiccode}|${c.question}`, c]))

  return progress
    .map((p) => {
      const content = contentMap.get(`${p.topiccode}|${p.question}`)
      return content
        ? {
            ...p,
            questiontype: content.questiontype,
            answer: content.answer,
            reported: content.reported,
            topic_tag: content.topic_tag,
            grammar_tag: content.grammar_tag,
          }
        : null
    })
    .filter(Boolean) as Array<Record<string, unknown>>
}

export async function upsertProgress(
  username: string,
  topiccode: string,
  question: string,
  attempts: number,
  corrects: number
) {
  const today = String(Math.floor(Date.now() / 86400000))
  const [result] = await prisma.$transaction([
    prisma.tblProgress.deleteMany({
      where: { username, topiccode, question },
    }),
    prisma.tblProgress.create({
      data: {
        username,
        topiccode,
        question,
        attempts: String(attempts),
        corrects: String(corrects),
        lastDate: today,
      },
    }),
  ])
  return result
}

/**
 * Generate a smart set of 40 items for cramming.
 *
 * Tiers:
 *   Tier 1 (struggle):  attempts / max(corrects,1) > 3   →  10 slots
 *   Tier 2 (learning):  corrects < 2                       →  15 slots
 *   Tier 3 (new):       no progress record                  →  15 slots
 *
 * Within each tier, items are sorted by lastDate ascending (oldest first).
 * Final set is shuffled with a no-adjacent-duplicates constraint.
 */
export async function generateSmartSet(
  username: string,
  topiccode: string,
  setSize = 40
) {
  const items = await prisma.tblContent.findMany({
    where: { topiccode, reported: { not: '1' } },
  })
  const progress = await prisma.tblProgress.findMany({
    where: { username, topiccode },
  })

  const masteredQuestions = new Set(
    progress.filter((p) => Number(p.corrects) >= 2).map((p) => p.question)
  )

  if (masteredQuestions.size >= items.length) {
    return { items: [], allDone: true }
  }

  const progressMap = new Map(progress.map((p) => [p.question, p]))

  // Split into tiers
  const tier1: typeof items = [] // struggle: attempts/corrects > 3
  const tier2: typeof items = [] // learning: corrects < 2
  const tier3: typeof items = [] // new: no progress

  for (const item of items) {
    if (Number(item.reported)) continue
    if (masteredQuestions.has(item.question)) continue

    const prog = progressMap.get(item.question)
    if (!prog) {
      tier3.push(item)
    } else {
      const a = Number(prog.attempts) || 0
      const c = Math.max(Number(prog.corrects) || 0, 1)
      if (a / c > 3) {
        tier1.push(item)
      } else if (c < 2) {
        tier2.push(item)
      }
    }
  }

  // Sort each tier by lastDate ascending (oldest first)
  const sortByLastDate = (arr: typeof items) =>
    arr.sort((a, b) => {
      const da = Number(progressMap.get(a.question)?.lastDate ?? 0)
      const db = Number(progressMap.get(b.question)?.lastDate ?? 0)
      return da - db
    })

  sortByLastDate(tier1)
  sortByLastDate(tier2)

  // Shuffle tier3 (new words are random)
  for (let i = tier3.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[tier3[i], tier3[j]] = [tier3[j], tier3[i]]
  }

  // Allocate slots
  const pick = (pool: typeof items, count: number) => pool.splice(0, Math.min(count, pool.length))
  const selected = [
    ...pick(tier1, 10),
    ...pick(tier2, 15),
    ...pick(tier3, 15),
  ]

  // If we don't have enough, pull from remaining pools
  while (selected.length < setSize) {
    const remaining = [...tier1, ...tier2, ...tier3]
    if (remaining.length === 0) break
    const extra = remaining.shift()!
    selected.push(extra)
  }

  // Shuffle with adjacency constraint: no two consecutive items share topic_tag
  const shuffled: typeof items = []
  const pool = [...selected]
  let lastQuestion: string | null = null

  while (pool.length > 0) {
    let idx = -1
    for (let i = 0; i < pool.length; i++) {
      if (pool[i].question !== lastQuestion && pool[i].question !== null) {
        idx = i
        break
      }
    }
    if (idx === -1) idx = 0 // fallback if all remaining match (impossible in practice)
    const [picked] = pool.splice(idx, 1)
    lastQuestion = picked.question ?? null
    shuffled.push(picked)
  }

  const result = shuffled.map((item) => {
    const prog = progressMap.get(item.question)
    return {
      ...item,
      attempts: Number(prog?.attempts ?? 0),
      corrects: Number(prog?.corrects ?? 0),
    }
  })

  return { items: result, allDone: false }
}

/**
 * Generate a filtered set based on topic_tag, grammar_tag, and/or set range.
 * Used for ad-hoc practice sessions targeting specific weaknesses.
 */
export async function generateFilteredSet(
  username: string,
  filters: {
    topic_tags?: string[]
    grammar_tags?: string[]
    set_range?: { from: number; to: number }
  },
  setSize = 40
) {
  const where: Record<string, unknown> = { reported: { not: '1' } }

  if (filters.topic_tags?.length) {
    where.topic_tag = { in: filters.topic_tags }
  }
  if (filters.grammar_tags?.length) {
    where.grammar_tag = { in: filters.grammar_tags }
  }

  let allItems = await prisma.tblContent.findMany({ where })

  if (filters.set_range) {
    const codes: string[] = []
    for (let i = filters.set_range.from; i <= filters.set_range.to; i++) {
      codes.push(`SET${String(i).padStart(3, '0')}`)
    }
    allItems = allItems.filter((item) => item.topiccode && codes.includes(item.topiccode))
  }

  // Fall back to regular smart set if no filters applied meaningfully
  if (allItems.length === 0) {
    return { items: [], allDone: true }
  }

  const progress = await prisma.tblProgress.findMany({
    where: { username },
  })
  const progressMap = new Map(progress.map((p) => [p.question, p]))

  const unmastered = allItems.filter((item) => {
    if (Number(item.reported)) return false
    const prog = progressMap.get(item.question)
    return !prog || Number(prog.corrects) < 2
  })

  if (unmastered.length === 0) {
    return { items: [], allDone: true }
  }

  // Tier & pick same as generateSmartSet
  const tier1: typeof allItems = []
  const tier2: typeof allItems = []
  const tier3: typeof allItems = []

  for (const item of unmastered) {
    const prog = progressMap.get(item.question)
    if (!prog) {
      tier3.push(item)
    } else {
      const a = Number(prog.attempts) || 0
      const c = Math.max(Number(prog.corrects) || 0, 1)
      if (a / c > 3) tier1.push(item)
      else if (c < 2) tier2.push(item)
    }
  }

  const selected = [
    ...tier1.sort((a, b) => {
      const da = Number(progressMap.get(a.question)?.lastDate ?? 0)
      const db = Number(progressMap.get(b.question)?.lastDate ?? 0)
      return da - db
    }).slice(0, 10),
    ...tier2.sort((a, b) => {
      const da = Number(progressMap.get(a.question)?.lastDate ?? 0)
      const db = Number(progressMap.get(b.question)?.lastDate ?? 0)
      return da - db
    }).slice(0, 15),
    ...tier3.sort(() => Math.random() - 0.5).slice(0, 15),
  ]

  while (selected.length < setSize && unmastered.length > selected.length) {
    const remaining = unmastered.filter((item) => !selected.includes(item))
    if (remaining.length === 0) break
    selected.push(remaining[Math.floor(Math.random() * remaining.length)])
  }

  return {
    items: selected.map((item) => {
      const prog = progressMap.get(item.question)
      return {
        ...item,
        attempts: Number(prog?.attempts ?? 0),
        corrects: Number(prog?.corrects ?? 0),
      }
    }),
    allDone: false,
  }
}
