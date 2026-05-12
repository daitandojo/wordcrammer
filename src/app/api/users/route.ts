import { NextResponse } from 'next/server'
import { getUsers } from '@/lib/db/users'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const users = await getUsers()
    const sanitized = users.map(({ password, ...rest }) => ({ ...rest }))
    return NextResponse.json(sanitized)
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
