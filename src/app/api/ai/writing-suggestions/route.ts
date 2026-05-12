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
    const { userText, targetLanguageKey, sourceLanguageKey, suggestedVocabulary } = body

    if (!userText || !targetLanguageKey || !sourceLanguageKey) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters.' },
        { status: 400 }
      )
    }

    let vocabContext = ''
    if (suggestedVocabulary?.length) {
      vocabContext = `The user is trying to practice using: ${suggestedVocabulary.map((w: string) => `"${w}"`).join(', ')}. `
    }

    const prompt = `You are an expert language tutor specializing in ${targetLanguageKey}.
The user wrote in ${targetLanguageKey}:
---
${userText}
---
${vocabContext}

Your tasks:
1. Grammar/Syntax Correction — provide corrected version, focus on fixing errors naturally.
2. Vocabulary Suggestions — suggest 2-3 alternative/more advanced words in ${targetLanguageKey} with ${sourceLanguageKey} translation and reasoning.
3. Encouragement/Next Steps — brief encouraging remark and one area to focus on.

Format as JSON with keys: "correctedText" (string), "vocabularySuggestions" (array of {"word": string, "translation": string, "reason": string}), "feedbackSummary" (string).`

    const aiResponse = await chat(
      [{ role: 'user', content: prompt }],
      { temperature: 0.5, max_tokens: 700 }
    )

    const content = aiResponse.choices?.[0]?.message?.content
    if (!content) throw new Error('No response from AI')

    const parsed = JSON.parse(content)
    if (
      typeof parsed.correctedText === 'string' &&
      Array.isArray(parsed.vocabularySuggestions) &&
      typeof parsed.feedbackSummary === 'string'
    ) {
      const validSuggestions = parsed.vocabularySuggestions.filter(
        (s: Record<string, unknown>) =>
          typeof s.word === 'string' && typeof s.translation === 'string' && typeof s.reason === 'string'
      )

      return NextResponse.json({
        success: true,
        suggestions: {
          correctedText: parsed.correctedText.trim(),
          vocabularySuggestions: validSuggestions,
          feedbackSummary: parsed.feedbackSummary.trim(),
        },
      })
    }

    throw new Error('AI response format unexpected')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI writing assistance failed'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
