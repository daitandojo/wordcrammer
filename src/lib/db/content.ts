import { prisma } from '@/lib/prisma'

export async function getContentByTopic(topiccode: string) {
  return prisma.tblContent.findMany({
    where: { topiccode },
    orderBy: { id: 'asc' },
  })
}

export async function addContentItem(data: {
  topiccode: string
  question: string
  answer: string
}) {
  return prisma.tblContent.create({
    data: {
      topiccode: data.topiccode,
      questiontype: 'translate',
      question: data.question.substring(0, 35),
      answer: data.answer.substring(0, 35),
      reported: '0',
    },
  })
}

export async function reportContentItem(topiccode: string, question: string) {
  const items = await prisma.tblContent.findMany({
    where: { topiccode, question },
  })
  for (const item of items) {
    await prisma.tblContent.update({
      where: { id: item.id },
      data: { reported: '1' },
    })
  }
}

export async function deleteContentByTopic(topiccode: string) {
  return prisma.tblContent.deleteMany({ where: { topiccode } })
}

export async function saveFullSet(
  topiccode: string,
  items: Array<{ question: string; answer: string }>
) {
  await prisma.tblContent.deleteMany({ where: { topiccode } })
  if (items.length === 0) return
  await prisma.tblContent.createMany({
    data: items.map((item) => ({
      topiccode,
      questiontype: 'translate',
      question: item.question.substring(0, 35).replace(/ʹ/g, "'"),
      answer: item.answer.substring(0, 35).replace(/ʹ/g, "'"),
      reported: '0',
    })),
  })
}

export async function bulkSetContent(topiccode: string, items: Array<{ topiccode: string; questiontype: string; question: string; answer: string }>) {
  await prisma.tblContent.deleteMany({ where: { topiccode } })
  if (items.length === 0) return
  await prisma.tblContent.createMany({ data: items })
}

export async function updateContentItem(id: number, data: { question?: string; answer?: string }) {
  return prisma.tblContent.update({ where: { id }, data })
}
