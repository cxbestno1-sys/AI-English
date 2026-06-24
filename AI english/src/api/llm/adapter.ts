import type { ChatMessage, LLMConfig, LLMResponse } from '../../types/llm'

export interface LLMAdapter {
  chat(messages: ChatMessage[]): Promise<string>
  chatJSON<T>(messages: ChatMessage[]): Promise<T | null>
}

export function parseJSON<T>(text: string): T | null {
  try {
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    return JSON.parse(cleaned) as T
  } catch {
    return null
  }
}

export function buildChatBody(config: LLMConfig, messages: ChatMessage[], temperature = 0.7): object {
  return {
    model: config.modelName,
    messages,
    temperature,
  }
}

export function buildTTSBody(config: LLMConfig, text: string, voice = 'Chloe', speed = 1.0): object {
  return {
    model: config.ttsModel,
    messages: [
      {
        role: 'user',
        content: text,
      },
      {
        role: 'assistant',
        content: text,
      },
    ],
    modalities: ['audio'],
    audio: { voice, speed, format: 'wav' },
  }
}

/** Use the Vite dev proxy to avoid CORS issues */
function proxyFetch(target: string, headers: Record<string, string>, body: object): Promise<Response> {
  return fetch('/api/llm-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target, headers, body }),
  })
}

export async function fetchJSON<T>(url: string, headers: Record<string, string>, body: object): Promise<T | null> {
  try {
    const response = await proxyFetch(url, headers, body)
    if (!response.ok) {
      const err = await response.text()
      throw new Error(`API 请求失败 (${response.status}): ${err}`)
    }
    return await response.json() as T
  } catch (e: any) {
    throw e
  }
}

export async function fetchAudio(url: string, headers: Record<string, string>, body: object): Promise<Blob> {
  try {
    const response = await proxyFetch(url, headers, body)
    if (!response.ok) {
      const err = await response.text()
      throw new Error(`TTS 请求失败 (${response.status}): ${err}`)
    }
    const contentType = response.headers.get('content-type') || 'audio/wav'
    const arrayBuffer = await response.arrayBuffer()
    return new Blob([arrayBuffer], { type: contentType })
  } catch (e: any) {
    throw e
  }
}
