import { NextResponse } from 'next/server'
import { getTopicByCode, deleteTopic } from '@/lib/db/topics'
import { getContentByTopic } from '@/lib/db/content'
import { auth } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params
    const topic = await getTopicByCode(code)
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }
    const content = await getContentByTopic(code)
    return NextResponse.json({ topic, content })
  } catch (error) {
    console.error('Failed to fetch topic:', error)
    return NextResponse.json({ error: 'Failed to fetch topic' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { code } = await params
    await deleteTopic(code)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete topic:', error)
    return NextResponse.json({ error: 'Failed to delete topic' }, { status: 500 })
  }
}
