import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { transcribeAudio } from '@/lib/audio/google-stt'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { audio, language = 'es-ES' } = body

    if (!audio || typeof audio !== 'string') {
      return NextResponse.json({ error: 'Audio data is required' }, { status: 400 })
    }

    const result = await transcribeAudio(audio, language)

    return NextResponse.json({
      transcript: result.transcript,
      confidence: result.confidence,
    })
  } catch (error) {
    console.error('STT failed:', error)
    return NextResponse.json({ error: 'Speech recognition failed' }, { status: 500 })
  }
}
