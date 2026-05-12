/**
 * Sound effect utilities using the Web Audio API.
 * Pure functions — no React imports. Importable from server components.
 */

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (typeof window === 'undefined') return null as unknown as AudioContext
  if (!audioCtx) {
    audioCtx = new AudioContext()
    ;(window as unknown as Record<string, unknown>).__audioCtx = audioCtx
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

function playNote(freq: number, delay: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  try {
    const ctx = getCtx()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = type
    const t = ctx.currentTime + delay
    osc.frequency.setValueAtTime(freq, t)
    gain.gain.setValueAtTime(volume, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
    osc.start(t)
    osc.stop(t + duration)
  } catch { /* audio context not available */ }
}

export function playCorrectSound() {
  playNote(523, 0, 0.3, 'sine', 0.12)
  playNote(659, 0.08, 0.3, 'sine', 0.10)
  playNote(784, 0.16, 0.3, 'sine', 0.08)
  playNote(1047, 0.25, 0.4, 'sine', 0.05)
}

export function playIncorrectSound() {
  playNote(200, 0, 0.3, 'sawtooth', 0.08)
  playNote(150, 0.1, 0.3, 'sawtooth', 0.06)
}

export function playCompletionSound() {
  playNote(523, 0, 0.4, 'sine', 0.10)
  playNote(659, 0.1, 0.4, 'sine', 0.10)
  playNote(784, 0.2, 0.4, 'sine', 0.10)
  playNote(1047, 0.3, 0.6, 'sine', 0.10)
  playNote(1319, 0.4, 0.8, 'sine', 0.08)
  playNote(784, 0.3, 0.5, 'triangle', 0.04)
  playNote(1047, 0.4, 0.6, 'triangle', 0.04)
}

export function playLevelUpSound() {
  const notes = [392, 440, 523, 587, 659, 784, 880, 1047]
  notes.forEach((freq, i) => {
    playNote(freq, i * 0.1, 0.4, 'sine', 0.10)
    playNote(freq * 1.5, i * 0.1, 0.3, 'triangle', 0.03)
  })
  setTimeout(() => {
    playNote(523, 0, 1.0, 'sine', 0.06)
    playNote(659, 0, 1.0, 'sine', 0.06)
    playNote(784, 0, 1.0, 'sine', 0.06)
    playNote(1047, 0, 1.0, 'sine', 0.06)
  }, notes.length * 100)
}

export function playMasteredSound() {
  playNote(880, 0, 0.2, 'sine', 0.08)
  playNote(1109, 0.08, 0.3, 'sine', 0.06)
  playNote(1319, 0.16, 0.4, 'sine', 0.05)
}

export function playTickSound() {
  playNote(800, 0, 0.04, 'square', 0.03)
}

export function playTimeUpSound() {
  playNote(220, 0, 0.4, 'sawtooth', 0.08)
  playNote(165, 0.15, 0.4, 'sawtooth', 0.06)
}

export function playStreakSound() {
  playNote(659, 0, 0.3, 'sine', 0.10)
  playNote(784, 0.08, 0.3, 'sine', 0.08)
  playNote(1047, 0.16, 0.4, 'sine', 0.06)
}

export function playButtonTap() {
  playNote(600, 0, 0.02, 'sine', 0.02)
}

export function playSparkle() {
  playNote(1319, 0, 0.3, 'sine', 0.04)
  playNote(1760, 0.08, 0.3, 'sine', 0.03)
  playNote(2093, 0.16, 0.4, 'sine', 0.02)
}
