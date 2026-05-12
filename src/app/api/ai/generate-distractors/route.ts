import { NextResponse } from 'next/server'
import { chat } from '@/lib/deepseek'
import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { correctWord, targetLanguageKey, numDistractors = 3, excludedWords = [] } = body

    if (!correctWord || !targetLanguageKey) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters.' },
        { status: 400 }
      )
    }

    const prompt = `You are an expert language learning assistant.
Generate ${numDistractors} plausible but incorrect alternatives (distractors) for "${correctWord}" in ${targetLanguageKey}.
Distractors must be: semantically related, grammatically correct, similar length/complexity.
DO NOT include "${correctWord}" or: ${excludedWords.map((w: string) => `"${w}"`).join(', ') || 'none'}.

Format as JSON: {"distractors": ["word1", "word2", ...]}`

    const aiResponse = await chat(
      [{ role: 'user', content: prompt }],
      { temperature: 0.7, max_tokens: 150 }
    )

    const content = aiResponse.choices?.[0]?.message?.content
    if (!content) throw new Error('No response from AI')

    const parsed = JSON.parse(content)
    if (parsed.distractors && Array.isArray(parsed.distractors)) {
      const valid = parsed.distractors
        .filter(
          (d: string) =>
            typeof d === 'string' &&
            d.trim() !== '' &&
            !excludedWords.map((w: string) => w.toLowerCase()).includes(d.trim().toLowerCase())
        )
        .map((d: string) => d.trim())

      return NextResponse.json({ success: true, distractors: valid })
    }

    throw new Error('AI response format unexpected')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI distractor generation failed'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
