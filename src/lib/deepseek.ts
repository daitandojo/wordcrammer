const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1'
const MODEL = 'deepseek-v4-flash'

export type DeepSeekMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type DeepSeekConfig = {
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

export async function chat(
  messages: DeepSeekMessage[],
  config: DeepSeekConfig = {}
) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY is not configured')

  const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.max_tokens ?? 1024,
      stream: config.stream ?? false,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DeepSeek API error: ${res.status} ${err}`)
  }

  return res.json()
}

export async function chatStream(
  messages: DeepSeekMessage[],
  config: DeepSeekConfig = {}
) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY is not configured')

  const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.max_tokens ?? 1024,
      stream: true,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DeepSeek API error: ${res.status} ${err}`)
  }

  return res
}
