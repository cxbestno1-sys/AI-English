import { Star, Check, X, Lightbulb, TrendingUp } from 'lucide-react'
import type { ScoreResult } from '../types/dialogue'

interface ScoreResultProps {
  result: ScoreResult
  onClose: () => void
}

export function ScoreResult({ result, onClose }: ScoreResultProps) {
  const scoreColor = result.score >= 90 ? 'text-green-500' : result.score >= 70 ? 'text-warm-500' : 'text-red-500'
  const scoreBg = result.score >= 90 ? 'bg-green-50 border-green-200' : result.score >= 70 ? 'bg-warm-50 border-warm-200' : 'bg-red-50 border-red-200'

  return (
    <div className={`${scoreBg} border rounded-2xl p-4 animate-bounce-in`}>
      {/* Score header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`text-3xl font-black ${scoreColor}`}>
            {result.score}
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-700">
              {result.score >= 90 ? '太棒了！' : result.score >= 70 ? '不错！' : '继续加油！'}
            </span>
            {result.score >= 90 && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                <Star size={10} fill="currentColor" /> 金牌 +20XP
              </span>
            )}
            {result.score >= 70 && result.score < 90 && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-warm-600 bg-warm-100 px-2 py-0.5 rounded-full">
                <Star size={10} /> 银牌 +15XP
              </span>
            )}
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          ✕
        </button>
      </div>

      {/* Feedback */}
      <p className="text-sm text-slate-700 mb-3 font-medium">{result.feedback}</p>

      {/* Word analysis */}
      {(result.matched_words.length > 0 || result.missing_words.length > 0 || result.wrong_words.length > 0) && (
        <div className="space-y-2 mb-3">
          {result.matched_words.length > 0 && (
            <div className="flex items-center gap-2">
              <Check size={14} className="text-green-500" />
              <span className="text-xs text-slate-500">正确: </span>
              <span className="text-xs font-medium text-green-600">{result.matched_words.join(', ')}</span>
            </div>
          )}
          {result.missing_words.length > 0 && (
            <div className="flex items-center gap-2">
              <X size={14} className="text-red-400" />
              <span className="text-xs text-slate-500">缺失: </span>
              <span className="text-xs font-medium text-red-500">{result.missing_words.join(', ')}</span>
            </div>
          )}
          {result.wrong_words.length > 0 && (
            <div className="flex items-center gap-2">
              <X size={14} className="text-warm-500" />
              <span className="text-xs text-slate-500">错误: </span>
              <span className="text-xs font-medium text-slate-700">
                {result.wrong_words.map(w => `${w.expected} → ${w.said}`).join(', ')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      {result.tips.length > 0 && (
        <div className="bg-white/60 rounded-xl p-3 flex gap-2">
          <Lightbulb size={16} className="text-warm-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-warm-700 mb-1">发音建议</p>
            {result.tips.map((tip, i) => (
              <p key={i} className="text-xs text-warm-600 leading-relaxed">• {tip}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
