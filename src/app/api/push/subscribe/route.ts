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
    const { endpoint, keys } = body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }

    const username = session.user.name!

    // Remove old subscription for this endpoint if exists
    await prisma.tblPushSubscriptions.deleteMany({ where: { endpoint } })
    
    // Create new
    await prisma.tblPushSubscriptions.create({
      data: { username, endpoint, p256dh: keys.p256dh, auth: keys.auth },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to subscribe:', error)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
