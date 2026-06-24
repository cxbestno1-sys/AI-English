import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { InputPanel } from '../components/InputPanel'
import { SmartSuggest } from '../components/SmartSuggest'
import { SceneSelector } from '../components/SceneSelector'
import { DifficultyBar } from '../components/DifficultyBar'
import type { ContentType } from '../types/dialogue'
import type { LLMConfig } from '../types/llm'
import { getRecommendPrompt } from '../utils/prompts'
import { createChatLLM } from '../api/chat'

interface HomeProps {
  llmConfig: LLMConfig
  onGenerate: (content: { type: ContentType; scene: string; difficulty: string; content: string }) => void
}

export function Home({ llmConfig, onGenerate }: HomeProps) {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [contentType, setContentType] = useState<ContentType>('dialogue')
  const [scene, setScene] = useState('daily')
  const [difficulty, setDifficulty] = useState('beginner')
  const [loading, setLoading] = useState(false)
  const [recommendation, setRecommendation] = useState<{ type: ContentType; reason: string } | null>(null)

  const handleInputChange = useCallback((value: string) => {
    setInput(value)
    if (value.trim().length > 2) {
      clearTimeout((window as any)._recommendTimer)
      ;(window as any)._recommendTimer = setTimeout(async () => {
        try {
          const chatllm = createChatLLM(llmConfig)
          const result = await chatllm.chatJSON<{ recommended_type: ContentType; reason: string }>([
            { role: 'system', content: 'You are an English learning assistant. Return only JSON.' },
            { role: 'user', content: getRecommendPrompt(value) },
          ])
          if (result?.recommended_type) {
            setRecommendation({ type: result.recommended_type, reason: result.reason })
          }
        } catch {
          // Silently fail
        }
      }, 800)
    } else {
      setRecommendation(null)
    }
  }, [llmConfig])

  const handleGenerate = useCallback(async () => {
    if (!input.trim() || loading) return
    setLoading(true)
    try {
      await onGenerate({ type: contentType, scene, difficulty, content: input.trim() })
    } finally {
      setLoading(false)
    }
  }, [input, loading, contentType, scene, difficulty, onGenerate])

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Start Learning</h1>
        <p className="text-sm text-slate-400 mt-1">Paste words, phrases, or sentences to generate content</p>
      </div>

      <InputPanel value={input} onChange={handleInputChange} onGenerate={handleGenerate} loading={loading} />
      <SmartSuggest recommended={recommendation} selected={contentType} onSelect={setContentType} />
      <SceneSelector selected={scene} onChange={setScene} />
      <DifficultyBar selected={difficulty} onChange={setDifficulty} />
    </div>
  )
}
