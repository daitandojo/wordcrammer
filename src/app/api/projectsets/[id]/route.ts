import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getProjectSet, deleteProjectSet } from '@/lib/db/projectsets'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    const ps = await getProjectSet(Number(id))
    if (!ps) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (ps.createdBy && ps.createdBy !== session.user.name) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json(ps)
  } catch (error) {
    console.error('Failed to fetch project set:', error)
    return NextResponse.json({ error: 'Failed to fetch project set' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    const ps = await getProjectSet(Number(id))
    if (!ps) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (ps.createdBy && ps.createdBy !== session.user.name) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    await deleteProjectSet(Number(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete project set:', error)
    return NextResponse.json({ error: 'Failed to delete project set' }, { status: 500 })
  }
}
