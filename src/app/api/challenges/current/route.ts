import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    let challenge = await prisma.tblChallenges.findFirst({
      where: { startDate: { lte: now }, endDate: { gte: now } },
    })

    // Generate a weekly challenge if none exists
    if (!challenge) {
      const types = ['most_xp', 'most_sets', 'fastest_set', 'best_absorption']
      const type = types[Math.floor(Math.random() * types.length)]
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)

      const names: Record<string, string> = {
        most_xp: 'Most XP Earned',
        most_sets: 'Most Sets Completed',
        fastest_set: 'Fastest Set Time',
        best_absorption: 'Best Absorption Score',
      }

      challenge = await prisma.tblChallenges.create({
        data: {
          name: names[type] || 'Weekly Challenge',
          type,
          startDate: startOfWeek,
          endDate: endOfWeek,
          reward: 100,
        },
      })
    }

    return NextResponse.json({
      id: challenge.id,
      name: challenge.name,
      type: challenge.type,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      reward: challenge.reward,
    })
  } catch (error) {
    console.error('Failed to fetch challenge:', error)
    return NextResponse.json({ error: 'Failed to fetch challenge' }, { status: 500 })
  }
}
