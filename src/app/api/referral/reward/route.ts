import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { awardXp } from '@/lib/db/xp'

export async function POST() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const username = session.user.name!
    const user = await prisma.tblCrammers.findUnique({ where: { username } })

    if (!user?.referredBy) {
      return NextResponse.json({ rewarded: false, reason: 'not_referred' })
    }

    // Check if this is the user's first completed set
    const completedSets = await prisma.tblSessions.count({
      where: { username, score: { gt: 0 } },
    })

    if (completedSets > 1) {
      return NextResponse.json({ rewarded: false, reason: 'already_rewarded' })
    }

    // Find the referrer
    const referrer = await prisma.tblCrammers.findUnique({ where: { referralCode: user.referredBy } })
    if (!referrer) {
      return NextResponse.json({ rewarded: false, reason: 'referrer_not_found' })
    }

    // Award referrer +50 XP
    await awardXp(referrer.username, 50)

    return NextResponse.json({ rewarded: true, referrer: referrer.alterego })
  } catch (error) {
    console.error('Failed to process referral reward:', error)
    return NextResponse.json({ error: 'Failed to process referral reward' }, { status: 500 })
  }
}
