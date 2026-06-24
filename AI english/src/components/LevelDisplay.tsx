import { Trophy } from 'lucide-react'
import type { Level } from '../features/progress/types'

interface LevelDisplayProps {
  level: Level
  currentXP: number
  progress: { percent: number; next: number; current: number }
}

export function LevelDisplay({ level, currentXP, progress }: LevelDisplayProps) {
  return (
    <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-5 text-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-xs text-primary-100 font-medium">当前等级</p>
            <p className="text-xl font-black">{level.title}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-primary-100 font-medium">Lv.{level.level}</p>
          <p className="text-lg font-black">{currentXP}</p>
          <p className="text-[10px] text-primary-200">XP</p>
        </div>
      </div>

      {/* XP progress bar */}
      <div className="bg-white/20 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-500"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-primary-200">{progress.current} XP</span>
        <span className="text-[10px] text-primary-200">下一级: {progress.next} XP</span>
      </div>
    </div>
  )
}
