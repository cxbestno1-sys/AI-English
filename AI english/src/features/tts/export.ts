import JSZip from 'jszip'
import type { LLMConfig } from '../../types/llm'
import { createTTSLLM } from '../../api/tts'

function cleanFileName(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, '_').substring(0, 50)
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}

async function decodeToPCM(blob: Blob): Promise<{ samples: Float32Array; sampleRate: number }> {
  const audioCtx = new AudioContext()
  try {
    const arrayBuffer = await blob.arrayBuffer()
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
    const channelData = audioBuffer.getChannelData(0)
    return { samples: channelData, sampleRate: audioBuffer.sampleRate }
  } finally {
    await audioCtx.close()
  }
}

function createWavFromPCM(samples: Float32Array, sampleRate: number): Blob {
  const numChannels = 1
  const bitDepth = 16
  const bytesPerSample = bitDepth / 8
  const dataLength = samples.length * bytesPerSample

  const buffer = new ArrayBuffer(44 + dataLength)
  const view = new DataView(buffer)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataLength, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true)
  view.setUint16(32, numChannels * bytesPerSample, true)
  view.setUint16(34, bitDepth, true)
  writeString(view, 36, 'data')
  view.setUint32(40, dataLength, true)

  let offset = 44
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    const intSample = s < 0 ? s * 0x8000 : s * 0x7FFF
    view.setInt16(offset, intSample, true)
    offset += 2
  }

  return new Blob([buffer], { type: 'audio/wav' })
}

async function mergeAudioBlobs(blobs: Blob[]): Promise<Blob> {
  const decoded = await Promise.all(blobs.map(b => decodeToPCM(b)))
  const sampleRate = decoded[0].sampleRate
  const totalLength = decoded.reduce((sum, d) => sum + d.samples.length, 0)
  const merged = new Float32Array(totalLength)
  let offset = 0
  for (const d of decoded) {
    merged.set(d.samples, offset)
    offset += d.samples.length
  }
  return createWavFromPCM(merged, sampleRate)
}

function getExtension(contentType: string): string {
  if (contentType.includes('mpeg') || contentType.includes('mp3')) return '.mp3'
  if (contentType.includes('wav') || contentType.includes('wave')) return '.wav'
  if (contentType.includes('ogg')) return '.ogg'
  if (contentType.includes('flac')) return '.flac'
  if (contentType.includes('aac')) return '.aac'
  return '.wav'
}

// Export using API TTS
async function exportWithAPI(
  title: string,
  lines: { speaker: string; english: string }[],
  config: LLMConfig,
  speed: number
): Promise<void> {
  const llm = createTTSLLM(config)
  const audioBlobs: Blob[] = []

  for (const line of lines) {
    const audioBlob = await llm.generateTTS(line.english, 'Chloe', speed)
    audioBlobs.push(audioBlob)
  }

  if (audioBlobs.length === 1) {
    const blob = audioBlobs[0]
    const ext = getExtension(blob.type)
    downloadBlob(blob, `${cleanFileName(title)}${ext}`)
  } else {
    const merged = await mergeAudioBlobs(audioBlobs)
    downloadBlob(merged, `${cleanFileName(title)}_完整.wav`)
  }
}

export async function exportAsWAV(
  text: string,
  filename: string,
  config?: LLMConfig,
  speed = 1.0
): Promise<void> {
  if (!config?.ttsBaseUrl || !config?.ttsApiKey) {
    throw new Error('请先在设置中配置语音模型 (TTS) 才能导出音频')
  }
  await exportWithAPI(filename, [{ speaker: 'text', english: text }], config, speed)
}

export async function exportAllAsZip(
  title: string,
  lines: { speaker: string; english: string }[],
  config?: LLMConfig,
  speed = 1.0
): Promise<void> {
  if (!config?.ttsBaseUrl || !config?.ttsApiKey) {
    throw new Error('请先在设置中配置语音模型 (TTS) 才能导出音频')
  }

  const zip = new JSZip()
  const folder = zip.folder(cleanFileName(title))
  if (!folder) return

  const llm = createTTSLLM(config)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const name = `${cleanFileName(line.speaker)}_${i + 1}.wav`
    const audioBlob = await llm.generateTTS(line.english, 'Chloe', speed)
    folder.file(name, audioBlob)
  }

  const content = await zip.generateAsync({ type: 'blob' })
  downloadBlob(content, `${cleanFileName(title)}.zip`)
}

export async function exportAsSingleWAV(
  title: string,
  lines: { speaker: string; english: string }[],
  config?: LLMConfig,
  speed = 1.0
): Promise<void> {
  if (!config?.ttsBaseUrl || !config?.ttsApiKey) {
    throw new Error('请先在设置中配置语音模型 (TTS) 才能导出音频')
  }
  await exportWithAPI(title, lines, config, speed)
}
