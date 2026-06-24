import type { Level } from './types'

export const LEVELS: Level[] = [
  { level: 1, title: '\u521d\u5b66\u8005', requiredXP: 0 },
  { level: 2, title: '\u5165\u95e8\u8005', requiredXP: 100 },
  { level: 3, title: '\u8fdb\u9636\u8005', requiredXP: 300 },
  { level: 4, title: '\u6d41\u5229\u8005', requiredXP: 600 },
  { level: 5, title: '\u7cbe\u901a\u8005', requiredXP: 1000 },
  { level: 6, title: '\u5927\u5e08', requiredXP: 2000 },
]

export function getLevel(xp: number): Level {
  let current = LEVELS[0]
  for (const level of LEVELS) {
    if (xp >= level.requiredXP) current = level
    else break
  }
  return current
}

export function getLevelProgress(xp: number): { current: number; next: number; percent: number } {
  const level = getLevel(xp)
  const nextLevel = LEVELS.find(l => l.level === level.level + 1)
  const currentRequired = level.requiredXP
  const nextRequired = nextLevel?.requiredXP ?? level.requiredXP + 1000
  return {
    current: xp - currentRequired,
    next: nextRequired - currentRequired,
    percent: nextRequired > currentRequired
      ? Math.min(100, ((xp - currentRequired) / (nextRequired - currentRequired)) * 100)
      : 100,
  }
}

export function calculateXP(earned: number, currentXP: number): { newXP: number; leveledUp: boolean } {
  const newXP = currentXP + earned
  const oldLevel = getLevel(currentXP).level
  const newLevel = getLevel(newXP).level
  return { newXP, leveledUp: newLevel > oldLevel }
}
