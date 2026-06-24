import type { LLMConfig } from '../../types/llm'
import { createTTSLLM } from '../../api/tts'

// Browser Speech Synthesis state
let currentUtterance: SpeechSynthesisUtterance | null = null
let currentAudioElement: HTMLAudioElement | null = null

// API TTS
async function speakWithAPI(
  text: string,
  rate: number,
  config: LLMConfig,
  onEnd?: () => void
): Promise<void> {
  const llm = createTTSLLM(config)
  const audioBlob = await llm.generateTTS(text, 'Chloe', rate)
  const url = URL.createObjectURL(audioBlob)
  const audio = new Audio(url)
  audio.onended = () => {
    URL.revokeObjectURL(url)
    onEnd?.()
  }
  audio.onerror = () => {
    URL.revokeObjectURL(url)
    console.warn('API TTS 播放失败')
    onEnd?.()
  }
  currentAudioElement = audio
  await audio.play()
}

// Browser TTS (Speech Synthesis API)
function speakWithBrowser(text: string, rate: number, onEnd?: () => void): void {
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = rate
  utterance.onend = () => {
    currentUtterance = null
    onEnd?.()
  }
  utterance.onerror = () => {
    currentUtterance = null
    onEnd?.()
  }
  currentUtterance = utterance
  window.speechSynthesis.speak(utterance)
}

// Main speak function
export function speak(options: {
  text: string
  rate?: number
  onEnd?: () => void
  config?: LLMConfig
}): void {
  const rate = options.rate ?? 1.0
  const config = options.config

  // If API TTS is configured, try it first; fall back to browser TTS on failure
  if (config?.ttsBaseUrl && config?.ttsApiKey) {
    speakWithAPI(options.text, rate, config, options.onEnd).catch(e => {
      console.warn('API TTS 失败，回退到浏览器 TTS:', e)
      speakWithBrowser(options.text, rate, options.onEnd)
    })
  } else {
    // No API TTS configured, use browser TTS directly
    speakWithBrowser(options.text, rate, options.onEnd)
  }
}

export function stopSpeaking(): void {
  window.speechSynthesis.cancel()
  currentUtterance = null
  if (currentAudioElement) {
    currentAudioElement.pause()
    currentAudioElement.currentTime = 0
    currentAudioElement = null
  }
}

export function isSpeaking(): boolean {
  if (window.speechSynthesis?.speaking) return true
  return currentAudioElement ? !currentAudioElement.paused : false
}
