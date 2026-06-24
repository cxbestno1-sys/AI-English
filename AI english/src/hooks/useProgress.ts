import { useState, useEffect, useCallback } from 'react'
import { getProgress, addXP, recordSession, recordExport, getLevelInfo, getBadges, checkAndUnlockBadges } from '../features/progress/store'
import type { LearnSession } from '../types/progress'

export function useProgress() {
  const [progress, setProgress] = useState(getProgress())
  const [newBadges, setNewBadges] = useState<string[]>([])

  const refresh = useCallback(() => { setProgress(getProgress()) }, [])

  const earnXP = useCallback((xp: number) => {
    const { newXP, leveledUp } = addXP(xp)
    setProgress(getProgress())
    if (leveledUp) { checkAndUnlockBadges() }
    return { newXP, leveledUp }
  }, [])

  const addSession = useCallback((session: Omit<LearnSession, 'timestamp'>) => {
    recordSession(session)
    setProgress(getProgress())
  }, [])

  const exportAudio = useCallback(() => {
    recordExport()
    setProgress(getProgress())
  }, [])

  const checkBadgesNow = useCallback(() => {
    const list = checkAndUnlockBadges()
    setNewBadges(list.map(b => b.id))
    setProgress(getProgress())
    setTimeout(() => setNewBadges([]), 3000)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { progress, level: getLevelInfo().level, levelProgress: getLevelInfo().progress, badges: getBadges(), newBadges, earnXP, addSession, exportAudio, checkBadgesNow, refresh }
}
