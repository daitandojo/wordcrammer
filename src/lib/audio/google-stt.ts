import { SpeechClient } from '@google-cloud/speech'
import { v1p1beta1 } from '@google-cloud/speech'

function getClient(): SpeechClient {
  const creds = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  if (!creds) throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON not configured')
  return new SpeechClient({ credentials: JSON.parse(creds) })
}

function getBetaClient(): v1p1beta1.SpeechClient {
  const creds = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  if (!creds) throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON not configured')
  return new v1p1beta1.SpeechClient({ credentials: JSON.parse(creds) })
}

export async function transcribeAudio(
  audioBase64: string,
  languageCode = 'es-ES'
): Promise<{ transcript: string; confidence: number }> {
  const client = getClient()
  const audio = { content: audioBase64 }
  const config = {
    encoding: 'WEBM_OPUS' as const,
    sampleRateHertz: 48000,
    languageCode,
    model: 'latest_long',
    enableAutomaticPunctuation: true,
  }

  const [response] = (await client.recognize({ audio, config })) as unknown as [{
    results?: Array<{ alternatives?: Array<{ transcript?: string; confidence?: number }> }>
  }]

  const result = response.results?.[0]?.alternatives?.[0]
  return {
    transcript: result?.transcript ?? '',
    confidence: result?.confidence ?? 0,
  }
}

export async function assessPronunciation(
  audioBase64: string,
  referenceText: string,
  languageCode = 'es-ES'
): Promise<{
  overallScore: number
  wordScores: Array<{ word: string; accuracyScore: number }>
}> {
  const client = getBetaClient()

  const config: Record<string, unknown> = {
    encoding: 'WEBM_OPUS',
    sampleRateHertz: 48000,
    languageCode,
    model: 'latest_long',
    enableWordTimeOffsets: true,
    pronunciationAssessmentConfig: {
      referenceText,
      enableWordLevelConfidence: true,
    },
  }

  const [response] = (await client.recognize({
    audio: { content: audioBase64 },
    config,
  })) as unknown as [{
    results?: Array<{
      alternatives?: Array<{
        transcript?: string
        words?: Array<{
          word?: string
          pronunciationAssessment?: { accuracyScore?: number }
        }>
      }>
    }>
  }]

  const result = response.results?.[0]
  const wordScores: Array<{ word: string; accuracyScore: number }> = []

  if (result?.alternatives?.[0]?.words) {
    for (const wordInfo of result.alternatives[0].words) {
      wordScores.push({
        word: wordInfo.word ?? '',
        accuracyScore: wordInfo.pronunciationAssessment?.accuracyScore ?? 0,
      })
    }
  }

  const overall = wordScores.reduce((a, w) => a + w.accuracyScore, 0) / Math.max(wordScores.length, 1)
  return { overallScore: Math.round(overall), wordScores }
}

export async function transcribeConversation(
  audioBase64: string,
  languageCode = 'es-ES'
): Promise<string> {
  const client = getClient()

  const [response] = (await client.recognize({
    audio: { content: audioBase64 },
    config: {
      encoding: 'WEBM_OPUS' as const,
      sampleRateHertz: 48000,
      languageCode,
      model: 'telephony',
      enableAutomaticPunctuation: true,
    },
  })) as unknown as [{
    results?: Array<{ alternatives?: Array<{ transcript?: string }> }>
  }]

  return response.results?.[0]?.alternatives?.[0]?.transcript ?? ''
}
