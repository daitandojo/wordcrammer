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
    const { endpoint } = body
    const username = session.user.name!

    if (endpoint) {
      await prisma.tblPushSubscriptions.deleteMany({ where: { endpoint } })
    } else {
      await prisma.tblPushSubscriptions.deleteMany({ where: { username } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to unsubscribe:', error)
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
  }
}
