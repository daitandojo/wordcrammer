import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getProjectSets, createProjectSet } from '@/lib/db/projectsets'

export async function GET() {
  const session = await auth()
  const username = session?.user?.name ?? null
  try {
    const sets = await getProjectSets(username)
    return NextResponse.json(sets)
  } catch (error) {
    console.error('Failed to fetch project sets:', error)
    return NextResponse.json({ error: 'Failed to fetch project sets' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { name, language } = await request.json()
    if (!name || !language) {
      return NextResponse.json({ error: 'name and language are required' }, { status: 400 })
    }
    const ps = await createProjectSet({ name, language, createdBy: session.user.name! })
    return NextResponse.json(ps)
  } catch (error) {
    console.error('Failed to create project set:', error)
    return NextResponse.json({ error: 'Failed to create project set' }, { status: 500 })
  }
}
