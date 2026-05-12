import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { awardXp } from '@/lib/db/xp'
import { XP_GAINS } from '@/lib/game-config'
import { xpAwardSchema } from '@/lib/validators'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = xpAwardSchema.parse(body)
    const { gameType, totalQuestions, score, isPerfectSession } = parsed
    const username = session.user.name!

    let xpGained = 0
    let bonuses: string[] = []

    if (gameType === 'flashcard-cram') {
      xpGained += XP_GAINS.WORD_CORRECT_FIRST_TIME_IN_SESSION * score
      xpGained += XP_GAINS.SESSION_COMPLETION_BASE
      const perfectItems = Math.floor(totalQuestions * XP_GAINS.SESSION_PERFECT_BONUS_PERCENT)
      if (isPerfectSession) { xpGained += perfectItems; bonuses.push('perfect') }

      // Variable rewards
      // Critical hit (5% chance for 2× session XP)
      if (Math.random() < 0.05 && xpGained > 0) {
        const bonus = Math.floor(xpGained * 0.5)
        xpGained += bonus
        bonuses.push('critical')
      }
      // Speed bonus (if score high relative to total)
      if (score >= totalQuestions * 0.8) {
        const speedBonus = Math.floor(XP_GAINS.SESSION_COMPLETION_BASE * 0.5)
        xpGained += speedBonus
        bonuses.push('speed')
      }
      // Mystery box (10% chance for random 10-50 XP)
      if (Math.random() < 0.1) {
        const mystery = Math.floor(Math.random() * 41) + 10
        xpGained += mystery
        bonuses.push('mystery')
      }
    } else if (gameType === 'multiple-choice' || gameType === 'listen-type' || gameType === 'gap-texts' || gameType === 'sentence-building') {
      xpGained += XP_GAINS.GAME_CORRECT_ANSWER * score
      xpGained += XP_GAINS.SESSION_COMPLETION_BASE
      if (isPerfectSession) xpGained += Math.floor(XP_GAINS.SESSION_COMPLETION_BASE * XP_GAINS.SESSION_PERFECT_BONUS_PERCENT)
    }

    const result = await awardXp(username, xpGained)

    return NextResponse.json({
      success: true,
      xpGained,
      totalXp: result.xp,
      level: result.level,
      leveledUp: result.level > result.previousLevel,
      bonuses,
    })
  } catch (error) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json({ error: 'Validation failed', details: (error as { issues: unknown }).issues }, { status: 400 })
    }
    console.error('Failed to award XP:', error)
    return NextResponse.json({ error: 'Failed to award XP' }, { status: 500 })
  }
}
