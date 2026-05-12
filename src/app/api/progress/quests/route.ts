import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { awardXp } from '@/lib/db/xp'

const QUEST_POOL = [
  { id: 'cram_1', label: 'Complete 1 cram session', icon: '📝', xp: 10, check: (s: number) => s >= 1 },
  { id: 'cram_2', label: 'Complete 2 cram sessions', icon: '📝', xp: 20, check: (s: number) => s >= 2 },
  { id: 'correct_10', label: 'Get 10 correct answers', icon: '✅', xp: 10, check: (_: number, totalCorrect: number) => totalCorrect >= 10 },
  { id: 'correct_20', label: 'Get 20 correct answers', icon: '✅', xp: 20, check: (_: number, totalCorrect: number) => totalCorrect >= 20 },
  { id: 'perfect_set', label: 'Complete a perfect set (all 40 mastered)', icon: '⭐', xp: 25, check: (_: number, _c: number, perfect: number) => perfect >= 1 },
  { id: 'streak_maintain', label: 'Maintain your streak', icon: '🔥', xp: 5, check: (s: number) => s >= 1 },
  { id: 'three_tags', label: 'Practice 3 different grammar types', icon: '🎯', xp: 15, check: (_: number, _c: number, _p: number, tags: number) => tags >= 3 },
]

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const username = session.user.name!
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayEnd = new Date(today.getTime() + 86400000)

  const todaySessions = await prisma.tblSessions.findMany({
    where: { username, createdAt: { gte: today, lt: todayEnd } },
  })

  const sessionCount = todaySessions.length
  const totalCorrect = todaySessions.reduce((a, s) => a + s.score, 0)
  const perfectSets = todaySessions.filter((s) => s.score === s.totalItems).length

  const todayProgress = await prisma.tblProgress.findMany({
    where: { username, lastDate: String(Math.floor(today.getTime() / 86400000)) },
  })
  const tagCount = new Set(todayProgress.map((p) => (p.question ?? '').split('|')[1] ?? '')).size

  const shuffled = [...QUEST_POOL].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, 3).map((q) => ({
    id: q.id,
    label: q.label,
    icon: q.icon,
    xp: q.xp,
    done: q.check(sessionCount, totalCorrect, perfectSets, tagCount),
  }))

  return NextResponse.json({
    date: today.toISOString().split('T')[0],
    quests: selected,
    sessionCount,
    totalCorrect,
  })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { questId } = body
    const username = session.user.name!

    const quest = QUEST_POOL.find((q) => q.id === questId)
    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    const result = await awardXp(username, quest.xp)

    return NextResponse.json({
      success: true,
      xpGained: quest.xp,
      totalXp: result.xp,
      level: result.level,
    })
  } catch (error) {
    console.error('Failed to claim quest:', error)
    return NextResponse.json({ error: 'Failed to claim quest' }, { status: 500 })
  }
}
