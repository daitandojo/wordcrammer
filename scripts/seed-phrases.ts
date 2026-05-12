import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const setThemes: [string, string][] = [
  ['SET001', 'Top 40 most useful everyday phrases'],
  ['SET002', 'Next 40 most useful everyday phrases'],
  ['SET003', 'Next 40 most useful everyday phrases'],
  ['SET004', 'Next 40 most useful everyday phrases'],
  ['SET005', 'Next 40 most useful everyday phrases'],
  ['SET006', 'Next 40 most useful everyday phrases'],
  ['SET007', 'Next 40 most useful everyday phrases'],
  ['SET008', 'Next 40 most useful everyday phrases'],
  ['SET009', 'Next 40 most useful everyday phrases'],
  ['SET010', 'Next 40 most useful everyday phrases'],
  ['SET011', 'Next 40 most useful everyday phrases'],
  ['SET012', 'Next 40 most useful everyday phrases'],
  ['SET013', 'Next 40 most useful everyday phrases'],
  ['SET014', 'Next 40 most useful everyday phrases'],
  ['SET015', 'Next 40 most useful everyday phrases'],
  ['SET016', 'Next 40 most useful everyday phrases'],
  ['SET017', 'Next 40 most useful everyday phrases'],
  ['SET018', 'Next 40 most useful everyday phrases'],
  ['SET019', 'Next 40 most useful everyday phrases'],
  ['SET020', 'Next 40 most useful everyday phrases'],
  ['SET021', 'Next 40 most useful everyday phrases'],
  ['SET022', 'Next 40 most useful everyday phrases'],
  ['SET023', 'Next 40 most useful everyday phrases'],
  ['SET024', 'Next 40 most useful everyday phrases'],
  ['SET025', 'Next 40 most useful everyday phrases'],
  ['SET026', 'Next 40 most useful everyday phrases'],
  ['SET027', 'Next 40 most useful everyday phrases'],
  ['SET028', 'Next 40 most useful everyday phrases'],
  ['SET029', 'Next 40 most useful everyday phrases'],
  ['SET030', 'Next 40 most useful everyday phrases'],
]

const API_KEY = process.env.DEEPSEEK_API_KEY
if (!API_KEY) {
  console.error('DEEPSEEK_API_KEY is required')
  process.exit(1)
}

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

async function generateSet(setCode: string, theme: string): Promise<string[]> {
  const prompt = `Generate 40 atomic phrases for English→Spanish language learning.
This is set ${setCode} — the ${theme}.
These are the 40 most useful everyday phrases that come after the previous sets.

IMPORTANT RULES:
- Each phrase is max 18 characters (source AND target).
- Mix of single words ("the mountain") and short phrases ("the cat sleeps").
- Spread across these topics: greetings, numbers, food, family, time, directions, shopping, weather, work, travel, health, home, opinions, descriptions, requests.
- For each phrase, assign a grammar tag from: cardinal_number, ordinal_number, present_verb, past_verb, future_verb, noun_phrase, adjective, adverb, preposition, question_word, imperative, article_noun.

Output format — pipe-delimited, one per line:
english phrase|spanish phrase|topic_tag|grammar_tag

Example:
good morning|buenos días|greetings|noun_phrase
two|dos|numbers|cardinal_number
I speak spanish|hablo español|opinions|present_verb
the mountain|la montaña|descriptions|noun_phrase

Output ONLY the 40 lines, nothing else.`

  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DeepSeek API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const content: string = data.choices?.[0]?.message?.content ?? ''
  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.includes('|'))
    .slice(0, 40)

  console.log(`  ${setCode}: got ${lines.length} lines`)
  return lines
}

async function main() {
  console.log('Connecting to database...')
  const adapter = new PrismaMariaDb(DATABASE_URL)
  const prisma = new PrismaClient({ adapter })
  await prisma.$connect()
  console.log('Connected.\n')

  for (const [setCode, theme] of setThemes) {
    console.log(`\n--- ${setCode}: ${theme} ---`)

    // Check if already seeded
    const existing = await prisma.tblTopics.findUnique({ where: { topiccode: setCode } })
    if (existing) {
      const count = await prisma.tblContent.count({ where: { topiccode: setCode } })
      if (count >= 40) {
        console.log(`  Already seeded with ${count} items, skipping.`)
        continue
      }
    }

    // Create or update the topic
    await prisma.tblTopics.upsert({
      where: { topiccode: setCode },
      update: {
        topictitle: theme,
        voice: 'es-ES',
        description: `Frequency set ${setCode.replace('SET', '')}/30 — ${theme}`,
      },
      create: {
        topiccode: setCode,
        topictitle: theme,
        voice: 'es-ES',
        description: `Frequency set ${setCode.replace('SET', '')}/30 — ${theme}`,
        setimage: '',
      },
    })

    // Delete old content for this set
    await prisma.tblContent.deleteMany({ where: { topiccode: setCode } })

    // Generate via DeepSeek
    let attempts = 0
    let lines: string[] = []
    while (lines.length < 40 && attempts < 3) {
      try {
        lines = await generateSet(setCode, theme)
      } catch (e) {
        console.error(`  Attempt ${attempts + 1} failed:`, e)
      }
      attempts++
    }

    if (lines.length === 0) {
      console.error(`  Failed to generate any phrases for ${setCode}`)
      continue
    }

    // Write to database
    let inserted = 0
    for (const line of lines) {
      const parts = line.split('|').map((s) => s.trim())
      if (parts.length < 2) continue
      const [question, answer, topic_tag, grammar_tag] = parts
      try {
        await prisma.tblContent.create({
          data: {
            topiccode: setCode,
            questiontype: 'translate',
            question: question.substring(0, 18),
            answer: answer.substring(0, 18),
            reported: '0',
            topic_tag: topic_tag?.substring(0, 50) ?? null,
            grammar_tag: grammar_tag?.substring(0, 50) ?? null,
          },
        })
        inserted++
      } catch (e) {
        // skip duplicates
      }
    }

    console.log(`  Inserted ${inserted} phrases`)
  }

  await prisma.$disconnect()
  console.log('\nDone! All 30 sets seeded.')
}

main().catch((e) => {
  console.error('Seed failed:', e)
  process.exit(1)
})
