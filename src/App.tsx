import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { Home } from './pages/Home'
import { LearnPage } from './pages/LearnPage'
import { HistoryPage } from './pages/HistoryPage'
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPanel } from './components/SettingsPanel'
import { Layout } from './components/Layout'
import type { LLMConfig } from './types/llm'
import { DEFAULT_CONFIG } from './types/llm'
import type { GeneratedContent, ContentType } from './types/dialogue'
import { get, set } from './utils/storage'
import { generateContent } from './features/content/generate'
import { createChatLLM } from './api/chat'

function App() {
  const [llmConfig, setLlmConfig] = useState<LLMConfig>(() => {
    const saved = localStorage.getItem('speaknow_llmConfig')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as LLMConfig
        return { ...DEFAULT_CONFIG, ...parsed }
      } catch {}
    }
    return { ...DEFAULT_CONFIG }
  })
  const navigate = useNavigate()
  const location = useLocation()
  const hasConfig = llmConfig.baseUrl.trim() && llmConfig.apiKey.trim()

  const saveConfig = useCallback((config: LLMConfig) => {
    setLlmConfig(config)
    localStorage.setItem('speaknow_llmConfig', JSON.stringify(config))
  }, [])

  const handleGenerate = useCallback(async (data: { type: ContentType; scene: string; difficulty: string; content: string }) => {
    if (!hasConfig) { navigate('/settings'); return }
    try {
      const llm = createChatLLM(llmConfig)
      const content = await generateContent(llm, data.content, data.type, data.scene, data.difficulty)
      const history = get<GeneratedContent[]>('history', [])
      history.unshift(content)
      if (history.length > 50) history.splice(50)
      set('history', history)
      navigate('/learn/' + content.id)
    } catch (e: any) {
      alert(e.message || '生成失败，请检查 API 配置和网络')
    }
  }, [hasConfig, llmConfig, navigate])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home llmConfig={llmConfig} onGenerate={handleGenerate} />} />
        <Route path="/learn/:id" element={<LearnPage llmConfig={llmConfig} />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPanel config={llmConfig} onSave={saveConfig} />} />
      </Routes>
    </Layout>
  )
}

export default App
