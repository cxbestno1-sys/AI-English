export interface TTSOptions {
  text: string
  rate: number
  volume: number
  pitch: number
  onBoundary?: (event: SpeechSynthesisEvent) => void
  onEnd?: () => void
}
