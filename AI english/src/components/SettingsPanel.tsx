import { useState } from 'react'
import { Save, Info } from 'lucide-react'
import type { LLMConfig } from '../types/llm'
import { DEFAULT_CONFIG } from '../types/llm'

interface SettingsPanelProps {
  config: LLMConfig
  onSave: (config: LLMConfig) => void
}

export function SettingsPanel({ config, onSave }: SettingsPanelProps) {
  const [form, setForm] = useState<LLMConfig>({
    baseUrl: config.baseUrl || DEFAULT_CONFIG.baseUrl,
    apiKey: config.apiKey || DEFAULT_CONFIG.apiKey,
    modelName: config.modelName || DEFAULT_CONFIG.modelName,
    ttsBaseUrl: config.ttsBaseUrl || DEFAULT_CONFIG.ttsBaseUrl,
    ttsApiKey: config.ttsApiKey || DEFAULT_CONFIG.ttsApiKey,
    ttsModel: config.ttsModel || DEFAULT_CONFIG.ttsModel,
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!form.apiKey.trim()) return
    onSave(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const hasChat = form.baseUrl.trim() && form.apiKey.trim()
  const hasTTS = form.ttsBaseUrl.trim() && form.ttsApiKey.trim()

  return (
    <div className="animate-slide-up">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">设置</h1>

      <div className="space-y-8">
        {/* 文本模型 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-primary-100 flex items-center justify-center">
              <span className="text-xs">✏️</span>
            </div>
            <h2 className="text-base font-bold text-slate-800">文本模型</h2>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                API 端点
              </label>
              <input
                type="url"
                value={form.baseUrl}
                onChange={e => setForm({ ...form, baseUrl: e.target.value })}
                placeholder="https://api.openai.com/v1/chat/completions"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-400 mt-1">支持 OpenAI / Azure / 本地部署 / 第三方代理等兼容端点</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                API Key
              </label>
              <input
                type="password"
                value={form.apiKey}
                onChange={e => setForm({ ...form, apiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                模型名称
              </label>
              <input
                type="text"
                value={form.modelName}
                onChange={e => setForm({ ...form, modelName: e.target.value })}
                placeholder="gpt-4o-mini"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 语音模型 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
              <span className="text-xs">🔊</span>
            </div>
            <h2 className="text-base font-bold text-slate-800">语音模型 (TTS)</h2>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                API 端点
              </label>
              <input
                type="url"
                value={form.ttsBaseUrl}
                onChange={e => setForm({ ...form, ttsBaseUrl: e.target.value })}
                placeholder="https://api.openai.com/v1/audio/speech"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-400 mt-1">用于生成语音音频，不填则使用浏览器内置 TTS</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                API Key
              </label>
              <input
                type="password"
                value={form.ttsApiKey}
                onChange={e => setForm({ ...form, ttsApiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                语音模型
              </label>
              <input
                type="text"
                value={form.ttsModel}
                onChange={e => setForm({ ...form, ttsModel: e.target.value })}
                placeholder="mimo-v2.5-tts"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 状态提示 */}
        <div className="space-y-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
            hasChat ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-400'
          }`}>
            <span>{hasChat ? '✓' : '○'}</span>
            文本模型: {form.modelName || '未配置'}
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
            hasTTS ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-400'
          }`}>
            <span>{hasTTS ? '✓' : '○'}</span>
            语音模型: {form.ttsModel || '浏览器内置'}
          </div>
        </div>

        {/* 保存按钮 */}
        <button
          onClick={handleSave}
          disabled={!hasChat}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            hasChat
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 active:scale-[0.98]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {saved ? (
            <>
              <Save size={18} />
              已保存
            </>
          ) : (
            <>
              <Save size={18} />
              保存配置
            </>
          )}
        </button>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-700">提示</p>
            <p className="text-xs text-blue-600 mt-1 leading-relaxed">
              所有密钥仅存储在浏览器本地，不会上传到任何服务器。<br/>
              文本模型必填，语音模型可选（可选用浏览器内置 TTS）。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
