export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMResponse {
  content: string
}

export interface LLMAdapter {
  chat(messages: ChatMessage[]): Promise<LLMResponse>
}

export interface LLMConfig {
  baseUrl: string
  apiKey: string
  modelName: string
  ttsBaseUrl: string
  ttsApiKey: string
  ttsModel: string
}

export const DEFAULT_CONFIG: LLMConfig = {
  baseUrl: '',
  apiKey: '',
  modelName: 'gpt-4o-mini',
  ttsBaseUrl: '',
  ttsApiKey: '',
  ttsModel: 'mimo-v2.5-tts',
}
