import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const username = session.user.name!
    const user = await prisma.tblCrammers.findUnique({ where: { username } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const today = String(Math.floor(Date.now() / 86400000))
    const lastDate = user.lastdate
    let streak = user.streak ?? 0
    let freezeAvailable = user.streakFreeze ?? 0
    let freezeUsed = false

    if (lastDate === today) {
      return NextResponse.json({ streak, updated: false })
    }

    const yesterday = String(Math.floor(Date.now() / 86400000) - 1)

    if (lastDate === yesterday) {
      // Consecutive day
      streak += 1
      // Award a freeze every 3 days of streak
      if (streak % 3 === 0) freezeAvailable += 1
    } else if (lastDate && lastDate !== today) {
      // Gap — try to use freeze
      if (freezeAvailable > 0) {
        freezeAvailable -= 1
        freezeUsed = true
        // Don't reset streak, just notify
      } else {
        streak = 1
      }
    } else {
      // First ever
      streak = 1
    }

    await prisma.tblCrammers.update({
      where: { username },
      data: { streak, lastdate: today, streakFreeze: freezeAvailable },
    })

    return NextResponse.json({ streak, updated: true, freezeUsed, freezeAvailable })
  } catch (error) {
    console.error('Failed to update streak:', error)
    return NextResponse.json({ error: 'Failed to update streak' }, { status: 500 })
  }
}
