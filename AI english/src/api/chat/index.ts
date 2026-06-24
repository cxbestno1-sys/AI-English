import type { ChatMessage, LLMConfig } from '../../types/llm'
import { buildChatBody, fetchChatProxy, parseJSON } from './adapter'

/** Resolve the chat API URL, appending /chat/completions if needed */
function resolveChatUrl(baseUrl: string): string {
  const url = baseUrl.replace(/\/+$/, '')
  if (url.endsWith('/chat/completions')) return url
  if (url.endsWith('/v1')) return url + '/chat/completions'
  return url + '/chat/completions'
}

export class ChatLLM {
  private config: LLMConfig

  constructor(config: LLMConfig) {
    this.config = config
  }

  private get headers() {
    return { 'api-key': this.config.apiKey }
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    if (!this.config.apiKey) throw new Error('请先配置 API Key')
    if (!this.config.baseUrl) throw new Error('请先配置文本模型端点')
    const url = resolveChatUrl(this.config.baseUrl)
    const body = buildChatBody(this.config, messages)
    const resp = await fetchChatProxy(url, this.headers, body)
    if (!resp.ok) {
      const err = await resp.text()
      throw new Error(`API 请求失败 (${resp.status}): ${err}`)
    }
    const data = await resp.json() as any
    return data?.choices?.[0]?.message?.content ?? ''
  }

  async chatJSON<T>(messages: ChatMessage[]): Promise<T | null> {
    const text = await this.chat(messages)
    return parseJSON<T>(text)
  }
}

export function createChatLLM(config: LLMConfig): ChatLLM {
  return new ChatLLM(config)
}

export { parseJSON }
export type { ChatMessage, LLMConfig }
