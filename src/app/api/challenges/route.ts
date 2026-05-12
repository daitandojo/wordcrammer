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
    const { targetUsername, topiccode } = body
    const challenger = session.user.name!

    if (!targetUsername || !topiccode) {
      return NextResponse.json({ error: 'targetUsername and topiccode required' }, { status: 400 })
    }

    const target = await prisma.tblCrammers.findUnique({ where: { username: targetUsername } })
    if (!target) return NextResponse.json({ error: 'Target user not found' }, { status: 404 })

    const code = `CHL${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    const challenge = await prisma.tblSessions.create({
      data: {
        username: challenger,
        topiccode: code,
        topictitle: `Challenge vs ${targetUsername}`,
        score: 0,
        totalItems: 40,
        xpEarned: 0,
        attempts: 0,
      },
    })

    return NextResponse.json({ code, shareUrl: `/challenge/${code}` })
  } catch (error) {
    console.error('Failed to create challenge:', error)
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 })
  }
}
