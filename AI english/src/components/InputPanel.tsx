import { Send } from 'lucide-react'

interface InputPanelProps {
  value: string
  onChange: (value: string) => void
  onGenerate: () => void
  loading: boolean
}

export function InputPanel({ value, onChange, onGenerate, loading }: InputPanelProps) {
  const canGenerate = value.trim().length > 0 && !loading

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="粘贴单词、短语或句子..."
        className="w-full px-4 py-3 rounded-xl bg-slate-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
        rows={3}
        maxLength={500}
      />
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-slate-400">{value.length}/500</span>
        <button
          onClick={onGenerate}
          disabled={!canGenerate}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            canGenerate
              ? 'bg-primary-600 text-white shadow-md shadow-primary-200 active:scale-[0.97]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={16} />
          )}
          {loading ? '生成中...' : '生成'}
        </button>
      </div>
    </div>
  )
}
