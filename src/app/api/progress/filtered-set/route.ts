import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateFilteredSet } from '@/lib/db/progress'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { filters, size = 40 } = body
    const username = session.user.name!

    const result = await generateFilteredSet(username, filters ?? {}, size)

    if (result.allDone) {
      return NextResponse.json({ items: [], allDone: true })
    }

    return NextResponse.json({ items: result.items, allDone: false })
  } catch (error) {
    console.error('Failed to generate filtered set:', error)
    return NextResponse.json({ error: 'Failed to generate filtered set' }, { status: 500 })
  }
}
