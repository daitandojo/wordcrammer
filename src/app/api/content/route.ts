import { NextResponse } from 'next/server'
import { getContentByTopic, addContentItem, reportContentItem } from '@/lib/db/content'
import { reportContentSchema } from '@/lib/validators'
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const topiccode = searchParams.get('topiccode')

  if (!topiccode) {
    return NextResponse.json({ error: 'topiccode is required' }, { status: 400 })
  }

  try {
    const content = await getContentByTopic(topiccode)
    return NextResponse.json(content)
  } catch (error) {
    console.error('Failed to fetch content:', error)
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    if (body.action === 'report') {
      const parsed = reportContentSchema.parse(body)
      await reportContentItem(parsed.topiccode, parsed.question)
      return NextResponse.json({ success: true })
    }

    const item = await addContentItem(body)
    return NextResponse.json(item)
  } catch (error) {
    console.error('Failed to process content:', error)
    return NextResponse.json({ error: 'Failed to process content' }, { status: 500 })
  }
}
