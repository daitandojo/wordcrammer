import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { synthesizeSpeech } from '@/lib/audio/google-tts'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { text, language = 'es-ES', voice } = body

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const audioBase64 = await synthesizeSpeech(text, language, voice)

    return NextResponse.json({
      audio: audioBase64,
      contentType: 'audio/mpeg',
    })
  } catch (error) {
    console.error('TTS failed:', error)
    return NextResponse.json({ error: 'Speech synthesis failed' }, { status: 500 })
  }
}
