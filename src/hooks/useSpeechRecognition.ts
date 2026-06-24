import { useState, useCallback, useRef } from 'react'

export function useSpeechRecognition() {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  const startListening = useCallback((onFinalResult?: (text: string) => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition
      || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError('当前浏览器不支持语音识别，请使用 Chrome 或 Edge')
      return
    }

    stopListening()
    setError(null)
    setTranscript('')
    setInterimTranscript('')
    setListening(true)

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      let final = ''
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += t
        } else {
          interim += t
        }
      }
      if (final) {
        setTranscript(prev => (prev ? prev + ' ' + final : final).trim())
        setInterimTranscript('')
        onFinalResult?.(final.trim())
      } else {
        setInterimTranscript(interim)
      }
    }

    recognition.onerror = (event: any) => {
      const msgs: Record<string, string> = {
        'not-allowed': '麦克风权限被拒绝',
        'no-speech': '没有检测到语音',
        'audio-capture': '未检测到麦克风',
        'network': '网络错误',
      }
      setError(msgs[event.error] || '错误: ' + event.error)
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }

    try {
      recognition.start()
    } catch {
      setError('无法启动语音识别')
      setListening(false)
    }
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setListening(false)
  }, [])

  return {
    listening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    clearError: () => setError(null),
  }
}
