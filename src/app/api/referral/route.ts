import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { awardXp } from '@/lib/db/xp'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { referralCode } = body
    const username = session.user.name!

    if (!referralCode || typeof referralCode !== 'string') {
      return NextResponse.json({ error: 'Referral code required' }, { status: 400 })
    }

    // Find the referrer
    const referrer = await prisma.tblCrammers.findUnique({ where: { referralCode } })
    if (!referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
    }

    if (referrer.username === username) {
      return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 })
    }

    // Check if user already has a referrer
    const user = await prisma.tblCrammers.findUnique({ where: { username } })
    if (user?.referredBy) {
      return NextResponse.json({ error: 'Already referred' }, { status: 400 })
    }

    // Save who referred this user
    await prisma.tblCrammers.update({
      where: { username },
      data: { referredBy: referralCode },
    })

    // Award referrer +50 XP when referred user completes their first set
    // (handled by a separate check on set completion)

    return NextResponse.json({ success: true, referrer: referrer.alterego })
  } catch (error) {
    console.error('Failed to process referral:', error)
    return NextResponse.json({ error: 'Failed to process referral' }, { status: 500 })
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.tblCrammers.findUnique({ where: { username: session.user.name! } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Generate referral code if not exists
    if (!user.referralCode) {
      const code = 'WC' + Math.random().toString(36).slice(2, 8).toUpperCase()
      await prisma.tblCrammers.update({ where: { username: user.username }, data: { referralCode: code } })
      return NextResponse.json({ referralCode: code })
    }

    // Count referrals who have completed at least 1 set
    const referredCount = await prisma.tblProgress.count({
      where: {
        username: { in: (await prisma.tblCrammers.findMany({ where: { referredBy: user.referralCode } })).map((u) => u.username) },
        corrects: { gte: '2' },
      },
    })

    return NextResponse.json({
      referralCode: user.referralCode,
      shareUrl: `${process.env.NEXTAUTH_URL || 'https://wordcrammer.app'}/login?ref=${user.referralCode}`,
      referredCount,
    })
  } catch (error) {
    console.error('Failed to get referral:', error)
    return NextResponse.json({ error: 'Failed to get referral' }, { status: 500 })
  }
}
