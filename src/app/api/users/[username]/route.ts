import { NextResponse } from 'next/server'
import { getUserByUsername, deleteUser } from '@/lib/db/users'
import { auth } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params
    const user = await getUserByUsername(username)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const { password, ...safeUser } = user
    return NextResponse.json(safeUser)
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ username: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { username } = await params
    if (session.user.name !== username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    await deleteUser(username)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
