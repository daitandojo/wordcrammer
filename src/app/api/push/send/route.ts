import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sendPushNotification } from '@/lib/push'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, body: messageBody, url } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const sentCount = await sendPushNotification(session.user.name!, title, messageBody ?? '', url ?? '/')

    return NextResponse.json({ success: true, sentCount })
  } catch (error) {
    console.error('Failed to send push:', error)
    return NextResponse.json({ error: 'Failed to send push' }, { status: 500 })
  }
}
