import { Lightbulb, MessageCircle, BookOpen } from 'lucide-react'
import type { ContentType } from '../types/dialogue'

interface SmartSuggestProps {
  recommended: { type: ContentType; reason: string } | null
  selected: ContentType
  onSelect: (type: ContentType) => void
}

export function SmartSuggest({ recommended, selected, onSelect }: SmartSuggestProps) {
  const types: { id: ContentType; icon: typeof MessageCircle; label: string; desc: string }[] = [
    { id: 'dialogue', icon: MessageCircle, label: '日常对话', desc: '多角色对话练习' },
    { id: 'story', icon: BookOpen, label: '小故事', desc: '沉浸式故事阅读' },
  ]

  return (
    <div className="space-y-3">
      {/* AI Recommendation */}
      {recommended && (
        <div className="bg-warm-50 border border-warm-200 rounded-xl p-3 flex items-start gap-2.5">
          <Lightbulb size={18} className="text-warm-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warm-800">
              {recommended.type === 'dialogue' ? '🗣️ 建议对话' : '📖 建议故事'}
            </p>
            <p className="text-xs text-warm-600 mt-0.5">{recommended.reason}</p>
          </div>
        </div>
      )}

      {/* Manual selector */}
      <div className="flex gap-2">
        {types.map(type => {
          const Icon = type.icon
          const active = selected === type.id
          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={`flex-1 py-3 px-4 rounded-xl text-left transition-all ${
                active
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon size={18} />
                <span className="text-sm font-semibold">{type.label}</span>
              </div>
              <p className={`text-[11px] mt-1 ${active ? 'text-primary-100' : 'text-slate-400'}`}>
                {type.desc}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
