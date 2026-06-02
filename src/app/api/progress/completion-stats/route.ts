import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const allProgress = await prisma.tblProgress.findMany()
    const contentCounts = await prisma.tblContent.groupBy({
      by: ['topiccode'],
      _count: true,
    })
    const contentMap = new Map(contentCounts.map((c) => [c.topiccode, c._count]))
    const topicCodes = [...new Set(allProgress.map((p) => p.topiccode).filter(Boolean) as string[])]

    const completions: Record<string, number> = {}
    for (const code of topicCodes) {
      const total = contentMap.get(code) ?? 0
      if (total === 0) continue
      const usersForTopic = allProgress.filter((p) => p.topiccode === code)
      const userGroups = new Map<string, typeof usersForTopic>()
      for (const p of usersForTopic) {
        if (!p.username) continue
        const existing = userGroups.get(p.username) ?? []
        existing.push(p)
        userGroups.set(p.username, existing)
      }
      let completedCount = 0
      for (const [, items] of userGroups) {
        const mastered = items.filter((i) => Number(i.corrects) >= 2).length
        if (mastered >= total) completedCount++
      }
      completions[code] = completedCount
    }

    return NextResponse.json(completions)
  } catch (error) {
    console.error('Failed to fetch completion stats:', error)
    return NextResponse.json({ error: 'Failed to fetch completion stats' }, { status: 500 })
  }
}
