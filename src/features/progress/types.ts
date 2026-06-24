export interface UserProgress {
  xp: number
  level: number
  streak: number
  lastLoginDate: string
  totalReadings: number
  totalScores: number
  totalExports: number
  averageScore: number | null
  sceneUsage: Record<string, number>
  badgeUnlocks: string[]
  sessions: LearnSession[]
}

export interface LearnSession {
  contentId: string
  contentTitle: string
  type: 'dialogue' | 'story'
  lineIndex: number
  english: string
  chinese: string
  score: number | null
  timestamp: number
}

export interface Level {
  level: number
  title: string
  requiredXP: number
}

export interface Badge {
  id: string
  emoji: string
  name: string
  description: string
}

export interface DailyStats {
  date: string
  readings: number
  scores: number
  xp: number
  minutes: number
}
