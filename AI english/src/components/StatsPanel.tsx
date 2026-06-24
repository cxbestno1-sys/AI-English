interface StatsPanelProps {
  totalReadings: number
  totalScores: number
  totalExports: number
  averageScore: number | null
  streak: number
}

export function StatsPanel({ totalReadings, totalScores, totalExports, averageScore, streak }: StatsPanelProps) {
  const stats = [
    { label: '学习天数', value: streak, icon: '🔥' },
    { label: '跟读次数', value: totalReadings, icon: '🗣️' },
    { label: '平均分数', value: averageScore !== null ? `${averageScore}分` : '-', icon: '📊' },
    { label: '导出次数', value: totalExports, icon: '📥' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map(stat => (
        <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="text-lg mb-1">{stat.icon}</div>
          <p className="text-lg font-bold text-slate-800">{stat.value}</p>
          <p className="text-xs text-slate-400">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
