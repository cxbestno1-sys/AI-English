import type { LLMConfig } from '../../types/llm'
import { buildTTSBody, fetchTTSProxy } from './adapter'

/** Resolve the TTS API URL using chat completions endpoint.
 *  MiMo TTS uses the same /v1/chat/completions endpoint as text generation. */
function resolveTTSUrl(baseUrl: string): string {
  const url = baseUrl.replace(/\/+$/, '')
  if (url.endsWith('/chat/completions')) return url
  if (url.endsWith('/v1')) return url + '/chat/completions'
  return url + '/chat/completions'
}

export class TTSLLM {
  private config: LLMConfig

  constructor(config: LLMConfig) {
    this.config = config
  }

  private get headers() {
    return { 'api-key': this.config.ttsApiKey }
  }

  async generateTTS(text: string, voice = 'Chloe', speed = 1.0): Promise<Blob> {
    if (!this.config.ttsApiKey) throw new Error('请先配置 TTS API Key')
    if (!this.config.ttsBaseUrl) throw new Error('请先配置 TTS 端点')
    const url = resolveTTSUrl(this.config.ttsBaseUrl)
    const body = buildTTSBody(this.config, text, voice, speed)
    const resp = await fetchTTSProxy(url, this.headers, body)
    if (!resp.ok) {
      const err = await resp.text()
      throw new Error(`TTS 请求失败 (${resp.status}): ${err}`)
    }

    // Try parsing as JSON first (chat completions response with embedded audio)
    const contentType = resp.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const data = await resp.json()
      // Extract audio from chat completions response: choices[0].message.audio.data (base64)
      const audioData = data?.choices?.[0]?.message?.audio?.data
      if (audioData) {
        const binary = atob(audioData)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        return new Blob([bytes], { type: 'audio/wav' })
      }
      // Fallback: check for audio URL
      const audioUrl = data?.choices?.[0]?.message?.audio?.url
      if (audioUrl) {
        const audioResp = await fetch(audioUrl)
        const buf = await audioResp.arrayBuffer()
        return new Blob([buf], { type: 'audio/wav' })
      }
      throw new Error(`TTS 响应中没有音频数据: ${JSON.stringify(data).substring(0, 300)}`)
    }

    // Raw audio binary response
    const arrayBuffer = await resp.arrayBuffer()
    return new Blob([arrayBuffer], { type: contentType || 'audio/wav' })
  }
}

export function createTTSLLM(config: LLMConfig): TTSLLM {
  return new TTSLLM(config)
}

export type { LLMConfig }
