import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '../components/Header'
import { DialogueCard } from '../components/DialogueCard'
import { SpeedControl } from '../components/SpeedControl'
import { ScoreResult } from '../components/ScoreResult'
import { ExportDropdown } from '../components/ExportButton'
import { speak, stopSpeaking, isSpeaking } from '../features/tts/speak'
import { startListening, stopListening } from '../features/stt/listen'
import { scorePronunciation } from '../features/stt/score'
import { createLLM } from '../api/llm'
import { useProgress } from '../hooks/useProgress'
import type { Line, ScoreResult as ScoreResultType, GeneratedContent } from '../types/dialogue'
import { addHistory } from '../utils/storage'
import { exportAllAsZip, exportAsSingleWAV } from '../features/tts/export'
import type { LLMConfig } from '../types/llm'

const DEMO_CONTENT: GeneratedContent = {
  id: 'demo',
  title: 'At a Coffee Shop',
  type: 'dialogue',
  keywords: ['coffee', 'order', 'milk'],
  lines: [
    { speaker: 'Barista', english: 'Hi! What can I get for you today?', chinese: '你好！要点什么？' },
    { speaker: 'Customer', english: 'I would like a latte, please.', chinese: '我想要一杯拿铁。' },
    { speaker: 'Barista', english: 'Would you like any milk or sugar with that?', chinese: '需要加牛奶或糖吗？' },
    { speaker: 'Customer', english: 'Just a little milk, thank you.', chinese: '就加一点牛奶，谢谢。' },
  ],
  createdAt: Date.now(),
}

export function LearnPage({ llmConfig }: { llmConfig: LLMConfig }) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [content, setContent] = useState<GeneratedContent | null>(null)
  const [currentLine, setCurrentLine] = useState(0)
  const [speed, setSpeed] = useState(1.0)
  const [scoreResult, setScoreResult] = useState<ScoreResultType | null>(null)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(true)
  const { earnXP, addSession, checkBadgesNow } = useProgress()
  const contentRef = useRef<GeneratedContent | null>(null)

  // Load content
  useEffect(() => {
    if (id === 'latest') {
      const history = JSON.parse(localStorage.getItem('speaknow_history') || '[]') as GeneratedContent[]
      if (history.length > 0) {
        setContent(history[0])
        contentRef.current = history[0]
        setLoading(false)
        return
      }
    }
    if (id === 'demo' || !id) {
      setContent(DEMO_CONTENT)
      contentRef.current = DEMO_CONTENT
      setLoading(false)
      return
    }
    const history = JSON.parse(localStorage.getItem('speaknow_history') || '[]') as GeneratedContent[]
    const found = history.find(c => c.id === id)
    if (found) {
      setContent(found)
      contentRef.current = found
    } else {
      setContent(DEMO_CONTENT)
      contentRef.current = DEMO_CONTENT
    }
    setLoading(false)
  }, [id])

  const handleScoreRef = useRef<((userSaid: string) => Promise<void>) | null>(null)

  const handleScore = useCallback(async (userSaid: string) => {
    const currentContent = contentRef.current
    if (!currentContent) return
    const line = currentContent.lines[currentLine]
    const english = 'speaker' in line ? line.english : line.english
    if (!english) return
    try {
      const llm = createLLM(llmConfig)
      const result = await scorePronunciation(llm, english, userSaid)
      setScoreResult(result)
      if (result.score !== null) {
        const isDialogue = 'speaker' in line
        addSession({
          contentId: currentContent.id, contentTitle: currentContent.title,
          type: currentContent.type, lineIndex: currentLine,
          english, chinese: isDialogue ? line.chinese : line.chinese,
          score: result.score,
        })
        const xp = result.score >= 90 ? 20 : result.score >= 70 ? 15 : 5
        earnXP(xp)
        checkBadgesNow()
      }
    } catch {}
  }, [currentLine, llmConfig, addSession, earnXP, checkBadgesNow])

  // Keep ref in sync
  useEffect(() => { handleScoreRef.current = handleScore }, [handleScore])

  const handlePlay = useCallback((text: string, rate: number) => {
    speak({ text, rate, config: llmConfig })
  }, [llmConfig])

  const handleRecord = useCallback(() => {
    if (listening) { stopListening(); setListening(false); return }
    setListening(true)
    setTranscript('')
    startListening({
      lang: 'en-US',
      onResult: (t, isFinal) => {
        if (isFinal) {
          setListening(false)
          setTranscript(t)
          handleScoreRef.current?.(t)
        }
      },
      onError: (e) => { setListening(false); alert(e) },
      onEnd: () => { setListening(false) },
    })
  }, [listening])

  const handlePlayAll = useCallback(() => {
    const currentContent = contentRef.current
    if (!currentContent) return
    let i = 0
    const playNext = () => {
      if (i >= currentContent.lines.length) return
      const line = currentContent.lines[i]
      const english = 'speaker' in line ? line.english : line.english
      speak({ text: english, rate: speed, config: llmConfig, onEnd: () => { i++; setTimeout(playNext, 500) } })
      i++
    }
    playNext()
  }, [speed, llmConfig])

  const handleExportAll = useCallback(async () => {
    const currentContent = contentRef.current
    if (!currentContent) return
    try {
      const lines = currentContent.lines.map(l => ({ speaker: 'speaker' in l ? l.speaker : 'Narrator', english: l.english }))
      await exportAllAsZip(currentContent.title, lines, llmConfig, speed)
    } catch (e: any) {
      alert(e?.message || '导出失败，请检查 TTS 配置')
    }
  }, [llmConfig, speed])

  const handleExportMerged = useCallback(async () => {
    const currentContent = contentRef.current
    if (!currentContent) return
    try {
      const lines = currentContent.lines.map(l => ({ speaker: 'speaker' in l ? l.speaker : 'Narrator', english: l.english }))
      await exportAsSingleWAV(currentContent.title, lines, llmConfig, speed)
    } catch (e: any) {
      alert(e?.message || '导出失败，请检查 TTS 配置')
    }
  }, [llmConfig, speed])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>
  }

  if (!content) {
    return <div className="text-center py-16 text-slate-400"><p>Content not found</p><button onClick={() => navigate('/')} className="mt-4 text-primary-500 text-sm font-medium">Go Home</button></div>
  }

  const line = content.lines[currentLine]
  const isDialogue = 'speaker' in line
  const english = line.english
  const chinese = line.chinese
  const speaker = isDialogue ? line.speaker : line.narrator

  return (
    <div className="space-y-4 animate-slide-up">
      <Header title={content.title} />

      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${content.type === 'dialogue' ? 'bg-primary-100 text-primary-600' : 'bg-purple-100 text-purple-600'}`}>
          {content.type === 'dialogue' ? 'Dialogue' : 'Story'}
        </span>
        <ExportDropdown onExportAll={handleExportAll} onExportMerged={handleExportMerged} />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">{currentLine + 1} / {content.lines.length}</span>
        <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: ((currentLine + 1) / content.lines.length * 100) + '%' }} />
        </div>
      </div>

      <DialogueCard
        line={line as Line} index={0} speakerType={isDialogue ? 'dialogue' : 'story'}
        playing={isSpeaking()} onPlay={handlePlay} onStop={stopSpeaking}
        onRecord={handleRecord} listening={listening}
      />

      {listening && <div className="bg-slate-100 rounded-xl p-3 text-sm text-slate-600">Listening... {transcript || 'Please start speaking'}</div>}

      {scoreResult && <ScoreResult result={scoreResult} onClose={() => setScoreResult(null)} />}

      <SpeedControl speed={speed} onChange={setSpeed} onPlayAll={handlePlayAll} onExportAll={handleExportAll} onExportSingle={handleExportAll} />

      <div className="flex gap-3">
        <button onClick={() => setCurrentLine(p => Math.max(0, p - 1))} disabled={currentLine === 0}
          className="flex-1 py-3 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-50">
          Prev
        </button>
        <button onClick={() => {
          setCurrentLine(p => {
            if (p >= content.lines.length - 1) { addHistory(content); navigate('/') }
            return p + 1
          })
          setScoreResult(null); setTranscript('')
        }}
          className="flex-1 py-3 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-200">
          {currentLine >= content.lines.length - 1 ? 'Done' : 'Next'}
        </button>
      </div>
    </div>
  )
}
