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
    const { userPrompt, numWords, sourceLanguageKey, targetLanguageKey, existingWords = [] } = body

    if (!userPrompt || !numWords || !sourceLanguageKey || !targetLanguageKey) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters.' },
        { status: 400 }
      )
    }

    if (numWords <= 0 || numWords > 30) {
      return NextResponse.json(
        { success: false, error: 'Number of words must be between 1 and 30.' },
        { status: 400 }
      )
    }

    const instructionForLLM = `You are an expert language learning assistant. Generate ${numWords} unique vocabulary items based on the user's request.
User's request: "${userPrompt}".
Source Language: ${sourceLanguageKey}.
Target Language: ${targetLanguageKey}.

For each item, provide: "originalWord" (in source), "translatedWord" (in target), "exampleSentenceOriginal" (in source), "exampleSentenceTranslated" (in target).

**Exclusions** (do NOT generate these):
${existingWords.length > 0 ? existingWords.map((w: string) => `- "${w}"`).join('\n') : '- None'}

Format your response as a JSON object with key "words" — an array of exactly ${numWords} objects with keys: "originalWord", "translatedWord", "exampleSentenceOriginal", "exampleSentenceTranslated".`

    const aiResponse = await chat(
      [{ role: 'user', content: instructionForLLM }],
      { temperature: 0.5, max_tokens: numWords * 80 + 300 }
    )

    const content = aiResponse.choices?.[0]?.message?.content
    if (!content) throw new Error('No response from AI')

    const parsed = JSON.parse(content)
    if (parsed.words && Array.isArray(parsed.words)) {
      const validWords = parsed.words
        .filter(
          (w: Record<string, unknown>) =>
            typeof w.originalWord === 'string' &&
            typeof w.translatedWord === 'string' &&
            typeof w.exampleSentenceOriginal === 'string' &&
            typeof w.exampleSentenceTranslated === 'string'
        )
        .map((w: Record<string, string>) => ({
          originalWord: w.originalWord.trim(),
          translatedWord: w.translatedWord.trim(),
          exampleSentenceOriginal: w.exampleSentenceOriginal.trim(),
          exampleSentenceTranslated: w.exampleSentenceTranslated.trim(),
        }))

      return NextResponse.json({ success: true, words: validWords })
    }

    throw new Error('AI did not return words in the expected format')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI generation failed'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
