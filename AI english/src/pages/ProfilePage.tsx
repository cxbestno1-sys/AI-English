import { useNavigate } from 'react-router-dom'
import { LevelDisplay } from '../components/LevelDisplay'
import { BadgeWall } from '../components/BadgeWall'
import { StatsPanel } from '../components/StatsPanel'
import { getProgress, getLevelInfo, getBadges } from '../features/progress/store'
import { BADGES } from '../features/progress/badges'
import { Settings } from 'lucide-react'

export function ProfilePage() {
  const navigate = useNavigate()
  const progress = getProgress()
  const levelInfo = getLevelInfo()
  const badges = getBadges()

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
        <button onClick={() => navigate('/settings')}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all">
          <Settings size={18} />
        </button>
      </div>

      <LevelDisplay level={levelInfo.level} currentXP={progress.xp} progress={levelInfo.progress} />

      <div className="mt-6">
        <BadgeWall badges={badges} allBadges={BADGES} />
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Statistics</h3>
        <StatsPanel totalReadings={progress.totalReadings} totalScores={progress.totalScores}
          totalExports={progress.totalExports} averageScore={progress.averageScore} streak={progress.streak} />
      </div>
    </div>
  )
}
