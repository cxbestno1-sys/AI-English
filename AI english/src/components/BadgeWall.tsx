import type { Badge } from '../features/progress/types'

interface BadgeWallProps {
  badges: Badge[]
  allBadges: Badge[]
}

export function BadgeWall({ badges, allBadges }: BadgeWallProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-3">我的徽章 ({badges.length}/{allBadges.length})</h3>
      <div className="grid grid-cols-5 gap-3">
        {allBadges.map(badge => {
          const unlocked = badges.some(b => b.id === badge.id)
          return (
            <div
              key={badge.id}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                unlocked ? 'opacity-100' : 'opacity-30 grayscale'
              }`}
              title={`${badge.name}: ${badge.description}`}
            >
              <span className="text-2xl">{unlocked ? badge.emoji : '🔒'}</span>
              <span className="text-[9px] text-slate-500 text-center leading-tight font-medium">{badge.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
