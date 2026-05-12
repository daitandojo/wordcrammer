import { prisma } from '@/lib/prisma'

export async function getTopics() {
  const topics = await prisma.tblTopics.findMany({
    orderBy: { topictitle: 'asc' },
  })
  const topicsWithCount = await Promise.all(
    topics.map(async (topic) => {
      const count = await prisma.tblContent.count({
        where: { topiccode: topic.topiccode },
      })
      return { ...topic, itemcount: count }
    })
  )
  return topicsWithCount
}

export async function getTopicByCode(topiccode: string) {
  const topic = await prisma.tblTopics.findUnique({ where: { topiccode } })
  if (!topic) return null
  const count = await prisma.tblContent.count({
    where: { topiccode: topic.topiccode },
  })
  return { ...topic, itemcount: count }
}

export async function createTopic(data: {
  topiccode: string
  topictitle: string
  setimage: string
  voice: string
  description: string
}) {
  const existing = await prisma.tblTopics.findUnique({ where: { topiccode: data.topiccode } })
  if (existing) {
    await prisma.tblTopics.delete({ where: { topiccode: data.topiccode } })
  }
  return prisma.tblTopics.create({ data })
}

export async function updateTopic(
  topiccode: string,
  data: {
    topictitle?: string
    setimage?: string
    voice?: string
    description?: string
  }
) {
  return prisma.tblTopics.update({ where: { topiccode }, data })
}

export async function deleteTopic(topiccode: string) {
  await prisma.tblContent.deleteMany({ where: { topiccode } })
  await prisma.tblProgress.deleteMany({ where: { topiccode } })
  return prisma.tblTopics.delete({ where: { topiccode } })
}
