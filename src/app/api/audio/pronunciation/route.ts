import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { assessPronunciation } from '@/lib/audio/google-stt'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { audio, referenceText, language = 'es-ES' } = body

    if (!audio || !referenceText) {
      return NextResponse.json({ error: 'Audio and referenceText are required' }, { status: 400 })
    }

    const result = await assessPronunciation(audio, referenceText, language)

    return NextResponse.json({
      overallScore: result.overallScore,
      wordScores: result.wordScores,
    })
  } catch (error) {
    console.error('Pronunciation assessment failed:', error)
    return NextResponse.json({ error: 'Pronunciation assessment failed' }, { status: 500 })
  }
}
