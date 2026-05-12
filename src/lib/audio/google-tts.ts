import { TextToSpeechClient } from '@google-cloud/text-to-speech'

function getClient(): TextToSpeechClient {
  const creds = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  if (!creds) throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON not configured')
  return new TextToSpeechClient({ credentials: JSON.parse(creds) })
}

const LANGUAGE_VOICE_MAP: Record<string, string> = {
  es: 'es-ES-Wavenet-C',
  fr: 'fr-FR-Wavenet-C',
  de: 'de-DE-Wavenet-C',
  it: 'it-IT-Wavenet-C',
  nl: 'nl-NL-Wavenet-C',
  pt: 'pt-PT-Wavenet-C',
  da: 'da-DK-Wavenet-C',
  sv: 'sv-SE-Wavenet-C',
  nb: 'nb-NO-Wavenet-C',
  fi: 'fi-FI-Wavenet-C',
  pl: 'pl-PL-Wavenet-C',
  hu: 'hu-HU-Wavenet-C',
  el: 'el-GR-Wavenet-C',
  ro: 'ro-RO-Wavenet-C',
  ar: 'ar-XA-Wavenet-C',
  he: 'he-IL-Wavenet-C',
  ja: 'ja-JP-Wavenet-C',
  zh: 'zh-CN-Wavenet-C',
  id: 'id-ID-Wavenet-C',
  uk: 'uk-UA-Wavenet-C',
}

export async function synthesizeSpeech(
  text: string,
  languageCode = 'es-ES',
  voiceName?: string
): Promise<string> {
  const client = getClient()
  const lang = languageCode.split('-')[0]
  const name = voiceName ?? LANGUAGE_VOICE_MAP[lang] ?? 'es-ES-Wavenet-C'

  const [response] = (await client.synthesizeSpeech({
    input: { text },
    voice: { languageCode, name },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 1.0,
      pitch: 0,
    },
  })) as unknown as [{ audioContent?: Uint8Array }]

  if (!response.audioContent) throw new Error('No audio content returned')
  return Buffer.from(response.audioContent).toString('base64')
}
