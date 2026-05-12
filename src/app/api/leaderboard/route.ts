import { NextResponse } from 'next/server'
import { getLeaderboardWithLevels } from '@/lib/db/xp'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') // 'weekly', 'monthly', or null (all time)

    if (period === 'weekly' || period === 'monthly') {
      const now = Date.now()
      const msCutoff = period === 'weekly' ? now - 7 * 86400000 : now - 30 * 86400000
      const cutoff = new Date(msCutoff)

      const sessions = await prisma.tblSessions.findMany({
        where: { createdAt: { gte: cutoff } },
        select: { username: true, xpEarned: true },
      })

      const xpMap = new Map<string, number>()
      for (const s of sessions) {
        xpMap.set(s.username, (xpMap.get(s.username) ?? 0) + s.xpEarned)
      }

      const usernames = Array.from(xpMap.keys())
      if (usernames.length === 0) {
        return NextResponse.json([])
      }

      const users = await prisma.tblCrammers.findMany({
        where: { username: { in: usernames } },
      })

      const leaders = users
        .map((u) => ({
          ...u,
          xp: xpMap.get(u.username) ?? 0,
          level: Number(u.level ?? 1),
        }))
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 50)
        .map(({ password, ...rest }) => rest)

      return NextResponse.json(leaders)
    }

    const leaders = await getLeaderboardWithLevels(50)
    const sanitized = leaders.map(({ password, ...rest }) => rest)
    return NextResponse.json(sanitized)
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
