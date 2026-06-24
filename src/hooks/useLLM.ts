import { useState, useCallback, useRef } from 'react'
import type { LLMAdapter, LLMConfig, ChatMessage } from '../api/llm'
import { createLLM } from '../api/llm'

export function useLLM() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const adapterRef = useRef<LLMAdapter | null>(null)

  const configure = useCallback((config: LLMConfig) => {
    adapterRef.current = createLLM(config)
  }, [])

  const chat = useCallback(async (messages: ChatMessage[]) => {
    if (!adapterRef.current) {
      setError('请先配置 LLM')
      return null
    }
    setLoading(true)
    setError(null)
    try {
      const result = await adapterRef.current.chat(messages)
      return result
    } catch (e: any) {
      setError(e.message || '请求失败')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { chat, loading, error, configure }
}
