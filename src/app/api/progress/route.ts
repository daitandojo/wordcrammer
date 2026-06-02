import { NextResponse } from 'next/server'
import { getUserProgress, generateSmartSet, upsertProgress } from '@/lib/db/progress'
import { updateUser } from '@/lib/db/users'
import { auth } from '@/lib/auth'
import { progressSchema } from '@/lib/validators'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const topiccode = searchParams.get('topiccode')
  const action = searchParams.get('action')

  try {
    const username = session.user.name!

    if (action === 'generateset' && topiccode) {
      const setSize = Number(searchParams.get('size') ?? 30)
      const result = await generateSmartSet(username, topiccode, setSize)
      return NextResponse.json(result)
    }

    const progress = await getUserProgress(username, topiccode ?? undefined)
    return NextResponse.json(progress)
  } catch (error) {
    console.error('Failed to fetch progress:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let body = {}
    const ct = request.headers.get('content-type') ?? ''
    if (ct.includes('application/json')) {
      const raw = await request.text()
      if (raw) body = JSON.parse(raw)
    }
    const parsed = progressSchema.parse(body)
    const { topiccode, question, correct } = parsed
    const username = session.user.name!

    const existing = await getUserProgress(username, topiccode)
    const existingItem = existing.find((p) => p.question === question)
    const prevAttempts = Number(existingItem?.attempts ?? 0)
    const prevCorrects = Number(existingItem?.corrects ?? 0)

    const newAttempts = prevAttempts + 1
    const newCorrects = correct ? prevCorrects + 1 : Math.max(0, prevCorrects - 1)

    await upsertProgress(username, topiccode, question, newAttempts, newCorrects)

    const user = await (await import('@/lib/db/users')).getUserByUsername(username)
    const currentAttempts = Number(user?.attempts ?? 0) + 1
    await updateUser(username, { attempts: String(currentAttempts) })

    if (correct) {
      const currentScore = Number(user?.score ?? 0) + question.length
      const currentCorrects = Number(user?.corrects ?? 0) + 1
      await updateUser(username, {
        score: String(currentScore),
        corrects: String(currentCorrects),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json({ error: 'Validation failed', details: (error as { issues: unknown }).issues }, { status: 400 })
    }
    console.error('Failed to update progress:', error)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}
