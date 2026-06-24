import type { STTOptions } from './types'

let recognition: any = null

const errorMessages: Record<string, string> = {
  'not-allowed': '麦克风权限被拒绝，请允许麦克风访问',
  'no-speech': '没有检测到语音，请再试一次',
  'audio-capture': '未检测到麦克风，请连接麦克风设备',
  'network': '网络错误，请检查网络连接',
}

export function startListening(options: STTOptions): boolean {
  const SpeechRecognition = (window as any).SpeechRecognition
    || (window as any).webkitSpeechRecognition

  if (!SpeechRecognition) {
    options.onError?.('当前浏览器不支持语音识别，请使用 Chrome 或 Edge')
    return false
  }

  recognition = new SpeechRecognition()
  recognition.lang = options.lang || 'en-US'
  recognition.interimResults = options.interimResults ?? true
  recognition.maxAlternatives = options.maxAlternatives || 1
  recognition.continuous = false

  recognition.onresult = (event: any) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const t = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        options.onResult?.(t.trim(), true)
      } else {
        options.onResult?.(t.trim(), false)
      }
    }
  }

  recognition.onerror = (event: any) => {
    const errorMsg = errorMessages[event.error] || ('识别错误: ' + event.error)
    options.onError?.(errorMsg)
  }

  recognition.onend = () => {
    options.onEnd?.()
  }

  try {
    recognition.start()
    return true
  } catch {
    options.onError?.('无法启动语音识别')
    return false
  }
}

export function stopListening(): void {
  if (recognition) {
    recognition.stop()
    recognition = null
  }
}
