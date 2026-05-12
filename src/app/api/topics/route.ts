import { NextResponse } from 'next/server'
import { getTopics, createTopic } from '@/lib/db/topics'
import { createTopicSchema } from '@/lib/validators'
import { saveFullSet } from '@/lib/db/content'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const topics = await getTopics()
    return NextResponse.json(topics)
  } catch (error) {
    console.error('Failed to fetch topics:', error)
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = createTopicSchema.parse(body)

    const { setdata, ...topicData } = parsed
    await createTopic(topicData)

    const items = setdata
      .split('\n')
      .filter((line) => line.includes('|') || line.includes('*'))
      .map((line) => {
        const parts = line.includes('|') ? line.split('|') : line.split('*')
        return { question: parts[0].trim(), answer: parts[1].trim() }
      })

    await saveFullSet(topicData.topiccode, items)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to create topic:', error)
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 })
  }
}
