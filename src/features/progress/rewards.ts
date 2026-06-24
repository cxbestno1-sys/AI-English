export function getXPForScore(score: number): number {
  if (score >= 90) return 20
  if (score >= 70) return 15
  return 5
}

export function getBadgeForScore(score: number): 'gold' | 'silver' | null {
  if (score >= 90) return 'gold'
  if (score >= 70) return 'silver'
  return null
}

export function getDailyXP(sessions: Array<{ score: number | null; timestamp: number }>): number {
  const today = new Date().toDateString()
  return sessions
    .filter(s => new Date(s.timestamp).toDateString() === today)
    .reduce((sum, s) => sum + (s.score !== null ? getXPForScore(s.score) : 5), 0)
}
