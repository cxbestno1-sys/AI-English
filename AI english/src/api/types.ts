import type { LLMConfig } from '../types/llm'

export interface APIResponse<T> {
  data: T
  error?: string
}

export type { LLMConfig }
