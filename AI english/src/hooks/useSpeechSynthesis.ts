import { useState, useCallback, useRef } from 'react'

export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false)
  const [currentText, setCurrentText] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const speak = useCallback((text: string, rate: number = 1.0) => {
    if (!window.speechSynthesis) return

    window.speechSynthesis.cancel()
    setCurrentText(text)
    setSpeaking(true)

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = rate
    utterance.pitch = 1.0

    const voices = window.speechSynthesis.getVoices()
    const usVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google'))
      || voices.find(v => v.lang === 'en-US')
      || voices.find(v => v.lang.startsWith('en'))
    if (usVoice) utterance.voice = usVoice

    utterance.onend = () => {
      setSpeaking(false)
      setCurrentText('')
      if (intervalRef.current) clearInterval(intervalRef.current)
    }

    utterance.onerror = () => {
      setSpeaking(false)
      setCurrentText('')
      if (intervalRef.current) clearInterval(intervalRef.current)
    }

    window.speechSynthesis.speak(utterance)
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
    setCurrentText('')
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  return { speak, stop, speaking, currentText }
}
