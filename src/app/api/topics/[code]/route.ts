import { NextResponse } from 'next/server'
import { getTopicByCode, deleteTopic, updateTopic } from '@/lib/db/topics'
import { getContentByTopic, bulkSetContent } from '@/lib/db/content'
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

export async function PUT(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { code } = await params
    const body = await request.json()
    const allowed = ['topictitle', 'description', 'sortOrder', 'voice']
    const data: Record<string, unknown> = {}
    for (const key of allowed) {
      if (body[key] !== undefined) data[key] = body[key]
    }
    const updated = await updateTopic(code, data)
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update topic:', error)
    return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { code } = await params
    const body = await request.json()
    if (body.action === 'bulk-content' && Array.isArray(body.items)) {
      const items = body.items.map((item: { question: string; answer: string }, i: number) => ({
        topiccode: code,
        questiontype: 'cram',
        question: item.question.trim(),
        answer: item.answer.trim(),
      }))
      await bulkSetContent(code, items)
      return NextResponse.json({ success: true, count: items.length })
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Failed to bulk update content:', error)
    return NextResponse.json({ error: 'Failed to bulk update content' }, { status: 500 })
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
