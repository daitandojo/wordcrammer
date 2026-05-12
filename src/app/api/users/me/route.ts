import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserWithStats, awardXp } from '@/lib/db/xp'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const email = session.user.email

  let user = await prisma.tblCrammers.findUnique({ where: { emailaddress: email } })

  if (!user) {
    const baseUsername = (session.user.name ?? 'user').replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 4)
    const suffix = Math.random().toString(36).slice(2, 4)
    const username = (baseUsername + suffix).slice(0, 6).padEnd(6, 'x')

    user = await prisma.tblCrammers.create({
      data: {
        username,
        firstname: session.user.name ?? 'User',
        alterego: session.user.name ?? 'User',
        emailaddress: email,
        attempts: '0',
        corrects: '0',
        score: '0',
        streak: 0,
        lastdate: String(Math.floor(Date.now() / (1000 * 60 * 60 * 24))),
        xp: 0,
        level: 1,
        sourceLanguage: 'en',
        targetLanguage: 'es',
      },
    })
  }

  return NextResponse.json({
    username: user.username,
    firstname: user.firstname,
    alterego: user.alterego,
    xp: Number(user.xp ?? 0),
    level: Number(user.level ?? 1),
    streak: user.streak ?? 0,
    targetLanguage: user.targetLanguage ?? 'es',
    sourceLanguage: user.sourceLanguage ?? 'en',
    email: user.emailaddress,
  })
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const email = session.user.email

    const updateData: Record<string, unknown> = {}
    if (body.targetLanguage) updateData.targetLanguage = body.targetLanguage
    if (body.sourceLanguage) updateData.sourceLanguage = body.sourceLanguage
    if (body.goal) updateData.goal = body.goal

    const user = await prisma.tblCrammers.update({
      where: { emailaddress: email },
      data: updateData,
    })

    return NextResponse.json({ success: true, targetLanguage: user.targetLanguage })
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
