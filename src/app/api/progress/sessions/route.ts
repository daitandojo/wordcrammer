import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { topiccode, topictitle, score, totalItems, xpEarned, attempts } = body
    const username = session.user.name!

    const record = await prisma.tblSessions.create({
      data: {
        username,
        topiccode: topiccode ?? null,
        topictitle: topictitle?.substring(0, 60) ?? null,
        score: score ?? 0,
        totalItems: totalItems ?? 0,
        xpEarned: xpEarned ?? 0,
        attempts: attempts ?? 0,
      },
    })

    return NextResponse.json({ success: true, id: record.id })
  } catch (error) {
    console.error('Failed to log session:', error)
    return NextResponse.json({ error: 'Failed to log session' }, { status: 500 })
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const username = session.user.name!
    const records = await prisma.tblSessions.findMany({
      where: { username },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json(records)
  } catch (error) {
    console.error('Failed to fetch sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}
