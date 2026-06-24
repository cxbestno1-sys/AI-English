import { useState, useCallback } from 'react'
import type { LLMConfig } from '../types/llm'
import { createLLM } from '../api/llm'
import { scorePronunciation } from '../features/stt/score'
import type { ScoreResult } from '../types/dialogue'

export function useScore() {
  const [scoring, setScoring] = useState(false)
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const score = useCallback(async (config: LLMConfig, target: string, userSaid: string) => {
    setScoring(true)
    setError(null)
    try {
      const llm = createLLM(config)
      const scoreResult = await scorePronunciation(llm, target, userSaid)
      setResult(scoreResult)
      return scoreResult
    } catch (e: any) {
      setError(e.message || '评分失败')
      return null
    } finally {
      setScoring(false)
    }
  }, [])

  const clearResult = useCallback(() => {
    setResult(null)
  }, [])

  return { score, scoring, result, error, clearResult }
}
