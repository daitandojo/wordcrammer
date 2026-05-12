'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Mic, MicOff, Loader2, Check, X } from 'lucide-react'

type VoiceInputProps = {
  language?: string
  referenceText?: string
  onResult: (transcript: string) => void
  onPronunciation?: (score: number, wordScores: Array<{ word: string; accuracyScore: number }>) => void
  disabled?: boolean
  className?: string
}

export default function VoiceInput({
  language = 'es-ES',
  referenceText,
  onResult,
  onPronunciation,
  disabled,
  className = '',
}: VoiceInputProps) {
  const [state, setState] = useState<'idle' | 'recording' | 'processing' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animRef = useRef<number | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (animRef.current) cancelAnimationFrame(animRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animRef.current = requestAnimationFrame(draw)
      analyser.getByteTimeDomainData(dataArray)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = 'rgba(59,130,246,0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.lineWidth = 2
      ctx.strokeStyle = '#3b82f6'
      ctx.beginPath()

      const sliceWidth = canvas.width / bufferLength
      let x = 0
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * canvas.height) / 2
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
        x += sliceWidth
      }
      ctx.stroke()
    }
    draw()
  }, [])

  const startRecording = async () => {
    try {
      setState('recording')
      setErrorMsg('')
      chunks.current = []

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Set up analyser for waveform
      const audioCtx = new AudioContext()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser
      drawWaveform()

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      mediaRecorder.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data)
      }

      recorder.onstop = async () => {
        if (animRef.current) cancelAnimationFrame(animRef.current)
        analyserRef.current = null
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null

        if (chunks.current.length === 0) {
          setState('idle')
          return
        }

        setState('processing')
        const blob = new Blob(chunks.current, { type: 'audio/webm;codecs=opus' })

        try {
          const reader = new FileReader()
          reader.readAsDataURL(blob)
          reader.onloadend = async () => {
            const base64 = (reader.result as string).split(',')[1]

            const [sttRes] = await Promise.all([
              fetch('/api/audio/stt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audio: base64, language }),
              }),
            ])

            const stt = await sttRes.json()
            if (stt.transcript) {
              onResult(stt.transcript)

              if (referenceText && onPronunciation) {
                const pronRes = await fetch('/api/audio/pronunciation', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ audio: base64, referenceText, language }),
                })
                const pron = await pronRes.json()
                if (pron.overallScore !== undefined) {
                  onPronunciation(pron.overallScore, pron.wordScores ?? [])
                }
              }
              setState('done')
              setTimeout(() => setState('idle'), 1500)
            } else {
              setErrorMsg('No speech detected')
              setState('error')
              setTimeout(() => setState('idle'), 2000)
            }
          }
        } catch {
          setErrorMsg('Processing failed')
          setState('error')
          setTimeout(() => setState('idle'), 2000)
        }
      }

      recorder.start()
      timerRef.current = setTimeout(() => {
        if (mediaRecorder.current?.state === 'recording') {
          mediaRecorder.current.stop()
        }
      }, 15000)
    } catch {
      setErrorMsg('Microphone access denied')
      setState('error')
      setTimeout(() => setState('idle'), 2000)
    }
  }

  const stopRecording = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stop()
    }
  }

  const isBusy = state === 'recording' || state === 'processing'

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={isBusy ? stopRecording : startRecording}
        disabled={disabled}
        className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-[0.95] ${
          state === 'recording'
            ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
            : state === 'processing'
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : state === 'done'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'glass glass-hover text-slate-400 hover:text-white border border-white/10'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        title={state === 'recording' ? 'Stop recording' : 'Speak your answer'}
      >
        {state === 'processing' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : state === 'done' ? (
          <Check className="w-4 h-4" />
        ) : state === 'recording' ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      {state === 'recording' && (
        <canvas
          ref={canvasRef}
          width={120}
          height={28}
          className="absolute top-1/2 -translate-y-1/2 left-12 rounded-lg bg-slate-900/60 border border-white/5 pointer-events-none"
        />
      )}

      {state === 'error' && (
        <span className="absolute top-1/2 -translate-y-1/2 left-12 text-[10px] text-red-400 whitespace-nowrap">
          {errorMsg}
        </span>
      )}
    </div>
  )
}
