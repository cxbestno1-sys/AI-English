// TTS audio recording for export
// Note: Browsers don't expose SpeechSynthesis audio as MediaStream
// This module provides WAV export using a workaround

export interface AudioChunk {
  samples: Float32Array
  sampleRate: number
}

// For browser TTS export, we generate a placeholder WAV
// In a production app, you'd use a server-side TTS API or
// a Chrome extension to capture the audio stream
export function generatePlaceholderWav(text: string, filename: string): Blob {
  // Create a silent WAV file (since we can't capture TTS audio directly)
  const sampleRate = 22050
  const duration = Math.max(1, text.length * 0.08) // Rough estimate
  const numSamples = Math.floor(sampleRate * duration)
  const buffer = new ArrayBuffer(44 + numSamples * 2)
  const view = new DataView(buffer)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + numSamples * 2, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(view, 36, 'data')
  view.setUint32(40, numSamples * 2, true)

  return new Blob([buffer], { type: 'audio/wav' })
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}
