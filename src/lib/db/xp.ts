import { prisma } from '@/lib/prisma'
import { calculateLevel } from '@/lib/game-config'

export async function awardXp(
  username: string,
  xpGained: number
): Promise<{ xp: number; level: number; previousLevel: number }> {
  const [user] = await prisma.$transaction(async (tx) => {
    const u = await tx.tblCrammers.findUnique({ where: { username } })
    if (!u) throw new Error('User not found')

    const currentXp = Number(u.xp ?? 0) + xpGained
    const previousLevel = Number(u.level ?? 1)
    const newLevel = calculateLevel(currentXp)

    await tx.tblCrammers.update({
      where: { username },
      data: { xp: currentXp, level: newLevel },
    })

    return [{ xp: currentXp, level: newLevel, previousLevel }]
  })

  return user
}

export async function getUserWithStats(username: string) {
  const user = await prisma.tblCrammers.findUnique({ where: { username } })
  if (!user) return null
  return {
    ...user,
    xp: Number(user.xp ?? 0),
    level: Number(user.level ?? 1),
  }
}

export async function getLeaderboardWithLevels(limit = 50) {
  const users = await prisma.tblCrammers.findMany({
    where: { xp: { gt: 0 } },
    orderBy: { xp: 'desc' },
    take: limit,
  })
  return users.map((u) => ({
    ...u,
    xp: Number(u.xp ?? 0),
    level: Number(u.level ?? 1),
  }))
}
