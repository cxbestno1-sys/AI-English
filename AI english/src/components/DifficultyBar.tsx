import { DIFFICULTIES } from '../utils/prompts'

interface DifficultyBarProps {
  selected: string
  onChange: (difficulty: string) => void
}

export function DifficultyBar({ selected, onChange }: DifficultyBarProps) {
  const colors: Record<string, string> = {
    beginner: 'bg-accent-500',
    intermediate: 'bg-warm-500',
    advanced: 'bg-red-500',
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        难度
      </label>
      <div className="flex gap-2">
        {DIFFICULTIES.map(d => (
          <button
            key={d.id}
            onClick={() => onChange(d.id)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
              selected === d.id
                ? `${colors[d.id]} text-white shadow-sm`
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {d.name}
            <span className="block text-[10px] opacity-70 mt-0.5">{d.level}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
