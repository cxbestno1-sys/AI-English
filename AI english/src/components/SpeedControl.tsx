import { Volume2 } from 'lucide-react'

interface SpeedControlProps {
  speed: number
  onChange: (speed: number) => void
  onPlayAll: () => void
  onExportAll: () => void
  onExportSingle: () => void
}

export function SpeedControl({ speed, onChange, onPlayAll, onExportAll }: SpeedControlProps) {
  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5]

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Volume2 size={16} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">语速</span>
        </div>
        <span className="text-sm font-bold text-primary-600">{speed}x</span>
      </div>

      {/* Speed slider */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 w-8">0.5x</span>
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.25"
          value={speed}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="flex-1 h-2 rounded-full appearance-none bg-slate-200 accent-primary-500"
        />
        <span className="text-xs text-slate-400 w-8 text-right">1.5x</span>
      </div>

      {/* Quick speed buttons */}
      <div className="flex gap-1.5 mt-3">
        {speeds.map(s => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              Math.abs(speed - s) < 0.01
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
        <button
          onClick={onPlayAll}
          className="flex-1 py-2 rounded-xl text-xs font-semibold bg-primary-50 text-primary-600 hover:bg-primary-100 transition-all"
        >
          连续播放
        </button>
        <button
          onClick={onExportAll}
          className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
        >
          📥 导出全部
        </button>
      </div>
    </div>
  )
}
