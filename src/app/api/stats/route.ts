import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logError } from '@/lib/api-error'

export async function GET() {
  try {
    const tenSecondsAgo = new Date(Date.now() - 10000)

    const [totalUsers, totalPhrases, totalSessions] = await Promise.all([
      prisma.tblCrammers.count().catch(() => 0),
      prisma.tblContent.count().catch(() => 0),
      prisma.tblSessions.count().catch(() => 0),
    ])

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todaySessions = totalSessions > 0
      ? await prisma.tblSessions.findMany({
          where: { createdAt: { gte: todayStart } },
          select: { score: true },
        }).catch(() => [])
      : []
    const phrasesToday = todaySessions.reduce((a, s) => a + s.score, 0)

    return NextResponse.json({ totalUsers, totalPhrases, totalSessions, phrasesToday })
  } catch (error) {
    logError('Stats API failed', error)
    // Return zeroed stats rather than failing — this is a non-critical endpoint
    return NextResponse.json({ totalUsers: 0, totalPhrases: 0, totalSessions: 0, phrasesToday: 0 })
  }
}
