import { get, set } from '../../utils/storage'
import type { UserProgress, LearnSession } from '../../types/progress'
import { getLevel, getLevelProgress } from './levels'
import { checkBadges, getUnlockedBadges } from './badges'

const PROGRESS_KEY = 'progress'

const DEFAULT_PROGRESS: UserProgress = {
  xp: 0,
  level: 1,
  streak: 0,
  lastLoginDate: new Date().toDateString(),
  totalReadings: 0,
  totalScores: 0,
  totalExports: 0,
  averageScore: null,
  sceneUsage: {},
  badgeUnlocks: [],
  sessions: [],
}

export function getProgress(): UserProgress {
  const progress = get<UserProgress>(PROGRESS_KEY, DEFAULT_PROGRESS)
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  if (progress.lastLoginDate !== today) {
    if (progress.lastLoginDate === yesterday) { progress.streak += 1 }
    else { progress.streak = 1 }
    progress.lastLoginDate = today
    set(PROGRESS_KEY, progress)
  }
  return progress
}

export function addXP(xp: number): { newXP: number; leveledUp: boolean } {
  const progress = getProgress()
  const oldLevel = getLevel(progress.xp).level
  progress.xp += xp
  progress.level = getLevel(progress.xp).level
  set(PROGRESS_KEY, progress)
  return { newXP: progress.xp, leveledUp: progress.level > oldLevel }
}

export function recordSession(session: Omit<LearnSession, 'timestamp'>): void {
  const progress = getProgress()
  const fullSession = { ...session, timestamp: Date.now() }
  progress.sessions.push(fullSession)
  if (session.score !== null) {
    progress.totalScores += 1
    progress.totalReadings += 1
    const scores = progress.sessions.filter(s => s.score !== null).map(s => s.score!)
    progress.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }
  const scene = session.contentTitle.split(' ')[0]
  progress.sceneUsage[scene] = (progress.sceneUsage[scene] || 0) + 1
  set(PROGRESS_KEY, progress)
}

export function recordExport(): void {
  const progress = getProgress()
  progress.totalExports += 1
  set(PROGRESS_KEY, progress)
}

export function recordReading(): void {
  const progress = getProgress()
  progress.totalReadings += 1
  set(PROGRESS_KEY, progress)
}

export function getLevelInfo(xp?: number) {
  const progress = getProgress()
  const xpToUse = xp ?? progress.xp
  return { level: getLevel(xpToUse), progress: getLevelProgress(xpToUse) }
}

export function getBadges() {
  const progress = getProgress()
  return getUnlockedBadges(progress.badgeUnlocks)
}

export function checkAndUnlockBadges() {
  const progress = getProgress()
  const newBadges = checkBadges({
    totalReadings: progress.totalReadings,
    totalExports: progress.totalExports,
    streak: progress.streak,
    sceneUsage: progress.sceneUsage,
    sessions: progress.sessions,
    badges: progress.badgeUnlocks,
  })
  if (newBadges.length > 0) {
    progress.badgeUnlocks = [...new Set([...progress.badgeUnlocks, ...newBadges.map(b => b.id)])]
    set(PROGRESS_KEY, progress)
  }
  return newBadges
}
