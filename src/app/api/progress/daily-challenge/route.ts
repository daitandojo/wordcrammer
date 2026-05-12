import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { chat } from '@/lib/deepseek'
import { generateSmartSet } from '@/lib/db/progress'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const username = session.user.name!

  // Get all sets the user is learning or hasn't started
  const topics = await prisma.tblTopics.findMany({
    where: { topiccode: { startsWith: 'SET' } },
    orderBy: { topiccode: 'asc' },
  })

  // Pick from SET001 for simplicity
  const result = await generateSmartSet(username, 'SET001', 10)

  // Generate a unique daily challenge via AI
  const prompt = `Generate 5 atomic English→Spanish phrase pairs for a daily language challenge.
They should be useful, everyday phrases. Max 18 chars each.
Format: english|spanish
No numbers, no bullet points. Just 5 pipe-delimited lines.`

  const aiRes = await chat([{ role: 'user', content: prompt }], { temperature: 0.8, max_tokens: 300 })
  const content: string = aiRes.choices?.[0]?.message?.content ?? ''
  const aiItems = content.split('\n').filter((l) => l.includes('|')).map((l) => {
    const [q, a] = l.split('|').map((s) => s.trim())
    return { question: q?.substring(0, 18) ?? '', answer: a?.substring(0, 18) ?? '' }
  }).slice(0, 5)

  return NextResponse.json({
    challenge: {
      review: (result.items ?? []).slice(0, 5),
      newPhrases: aiItems,
    },
    total: 10,
  })
}
