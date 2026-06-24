export interface STTOptions {
  lang?: string
  interimResults?: boolean
  maxAlternatives?: number
  onResult?: (transcript: string, isFinal: boolean) => void
  onError?: (error: string) => void
  onEnd?: () => void
}

export interface SpeechRecognitionConstructor {
  new (): {
    lang: string
    interimResults: boolean
    maxAlternatives: number
    continuous: boolean
    start: () => void
    stop: () => void
    abort: () => void
    onresult: ((event: any) => void) | null
    onerror: ((event: any) => void) | null
    onend: (() => void) | null
  }
}
