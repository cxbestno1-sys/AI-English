import type { ChatMessage, LLMConfig } from '../../types/llm'

export function buildChatBody(config: LLMConfig, messages: ChatMessage[], temperature = 0.7): object {
  return {
    model: config.modelName,
    messages,
    temperature,
  }
}

/** Fetch through the dedicated chat proxy */
export async function fetchChatProxy(url: string, headers: Record<string, string>, body: object): Promise<Response> {
  return fetch('/api/chat-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: url, headers, body }),
  })
}

export function parseJSON<T>(text: string): T | null {
  try {
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    return JSON.parse(cleaned) as T
  } catch {
    return null
  }
}
