import { prisma } from '@/lib/prisma'

export async function getUsers() {
  const users = await prisma.tblCrammers.findMany()
  return users.sort((a, b) => Number(b.score ?? 0) - Number(a.score ?? 0))
}

export async function getUserByUsername(username: string) {
  return prisma.tblCrammers.findUnique({ where: { username } })
}

export async function createUser(data: {
  username: string
  firstname: string
  alterego: string
  email?: string
}) {
  const existing = await prisma.tblCrammers.findUnique({ where: { username: data.username } })
  if (existing) {
    await prisma.tblCrammers.delete({ where: { username: data.username } })
  }
  return prisma.tblCrammers.create({
    data: {
      username: data.username,
      firstname: data.firstname,
      alterego: data.alterego,
      emailaddress: data.email ?? null,
      topiccode: null,
      attempts: '0',
      corrects: '0',
      score: '0',
      streak: 0,
      lastdate: String(Math.floor(Date.now() / (1000 * 60 * 60 * 24))),
      xp: 0,
      level: 1,
    },
  })
}

export async function updateUser(
  username: string,
  data: {
    firstname?: string
    alterego?: string
    emailaddress?: string
    mobile?: string
    topiccode?: string
    attempts?: string
    corrects?: string
    score?: string
    streak?: number
    lastdate?: string
  }
) {
  return prisma.tblCrammers.update({ where: { username }, data })
}

export async function deleteUser(username: string) {
  await prisma.tblProgress.deleteMany({ where: { username } })
  return prisma.tblCrammers.delete({ where: { username } })
}
