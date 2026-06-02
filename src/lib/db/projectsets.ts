import { prisma } from '@/lib/prisma'

export async function getProjectSets(username?: string | null) {
  const or: Array<{ createdBy: string | null }> = [{ createdBy: null }]
  if (username) or.push({ createdBy: username })
  const sets = await prisma.tblProjectSets.findMany({
    where: { OR: or },
    orderBy: { createdAt: 'asc' },
  })
  return Promise.all(
    sets.map(async (ps) => {
      const moduleCount = await prisma.tblTopics.count({ where: { projectSetId: ps.id } })
      return { id: ps.id, name: ps.name, language: ps.language, createdBy: ps.createdBy, createdAt: ps.createdAt, moduleCount }
    })
  )
}

export async function getProjectSet(id: number) {
  const ps = await prisma.tblProjectSets.findUnique({ where: { id } })
  if (!ps) return null
  const modules = await prisma.tblTopics.findMany({
    where: { projectSetId: id },
    orderBy: { sortOrder: 'asc' },
  })
  const modulesWithCount = await Promise.all(
    modules.map(async (m) => {
      const count = await prisma.tblContent.count({ where: { topiccode: m.topiccode } })
      return { ...m, itemcount: count }
    })
  )
  return { ...ps, modules: modulesWithCount }
}

export async function createProjectSet(data: { name: string; language: string; createdBy: string }) {
  return prisma.tblProjectSets.create({ data })
}

export async function deleteProjectSet(id: number) {
  const modules = await prisma.tblTopics.findMany({ where: { projectSetId: id }, select: { topiccode: true } })
  for (const m of modules) {
    await prisma.tblContent.deleteMany({ where: { topiccode: m.topiccode } })
    await prisma.tblProgress.deleteMany({ where: { topiccode: m.topiccode } })
    await prisma.tblTopics.delete({ where: { topiccode: m.topiccode } })
  }
  return prisma.tblProjectSets.delete({ where: { id } })
}
