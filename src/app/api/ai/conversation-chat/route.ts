import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { chat } from '@/lib/deepseek'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }

    const result = await chat(messages, { temperature: 0.7, max_tokens: 512 })
    const text = result.choices?.[0]?.message?.content ?? ''

    return NextResponse.json({ text })
  } catch (error) {
    console.error('Conversation chat failed:', error)
    return NextResponse.json({ error: 'Conversation failed' }, { status: 500 })
  }
}
