import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updateContentItem } from '@/lib/db/content'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    const body = await request.json()
    const data: { question?: string; answer?: string } = {}
    if (body.question !== undefined) data.question = body.question
    if (body.answer !== undefined) data.answer = body.answer
    const updated = await updateContentItem(Number(id), data)
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update content:', error)
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
  }
}
