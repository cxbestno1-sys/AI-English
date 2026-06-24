import type { Badge } from './types'

export const BADGES: Badge[] = [
  { id: 'first_step', emoji: '\ud83c\udf31', name: '\u7b2c\u4e00\u6b65', description: '\u7b2c\u4e00\u6b21\u751f\u6210\u5185\u5bb9' },
  { id: 'talker', emoji: '\ud83d\udde3\ufe0f', name: '\u5f00\u53e3\u738b', description: '\u7b2c\u4e00\u6b21\u8ddf\u8bfb' },
  { id: 'perfect', emoji: '\ud83d\udcaf', name: '\u6ee1\u5206\u8fbe\u4eba', description: '\u4e00\u6b21\u8ddf\u8bfb >= 95 \u5206' },
  { id: 'streak_3', emoji: '\ud83d\udd25', name: '\u4e09\u65e5\u8fde\u8d5b', description: '\u8fde\u7eed3\u5929\u5b66\u4e60' },
  { id: 'explorer', emoji: '\ud83c\udf0d', name: '\u63a2\u7d22\u8005', description: '\u4f7f\u75285\u79cd\u4e0d\u540c\u573a\u666f' },
  { id: 'storyteller', emoji: '\ud83d\udcda', name: '\u6545\u4e8b\u5bb6', description: '\u5b8c\u6210\u4e00\u7bc7\u6545\u4e8b\u5b66\u4e60' },
  { id: 'gold_rush', emoji: '\u2b50', name: '\u91d1\u724c\u624b', description: '\u7d2f\u8ba1\u83b7\u5f9710\u679a\u91d1\u724c' },
  { id: 'sharp_ear', emoji: '\ud83c\udaf1', name: '\u987a\u98ce\u8033', description: '\u8fde\u7eed5\u6b21\u8ddf\u8bfb >= 85 \u5206' },
  { id: 'sound_collector', emoji: '\ud83c\udf9e', name: '\u6536\u85cf\u5bb6', description: '\u5bfc\u51fa3\u6b21\u97f3\u9891' },
  { id: 'champion', emoji: '\ud83c\udfc6', name: '\u51a0\u519b', description: '\u8fbe\u5230 Lv.5' },
  { id: 'graduate', emoji: '\ud83c\udf93', name: '\u6bd5\u4e1a\u751f', description: '\u5b8c\u6210\u5168\u90e810\u79cd\u573a\u666f' },
]

export function getUnlockedBadges(unlockedIds: string[]): Badge[] {
  return BADGES.filter(b => unlockedIds.includes(b.id))
}

export function checkBadges(progress: {
  totalReadings: number
  totalExports: number
  streak: number
  sceneUsage: Record<string, number>
  sessions: any[]
  badges: string[]
}): Badge[] {
  const newBadges: Badge[] = []
  const unlocked = new Set(progress.badges)

  if (progress.sessions.length > 0 && !unlocked.has('first_step')) {
    newBadges.push(BADGES[0])
    unlocked.add('first_step')
  }
  if (progress.totalReadings > 0 && !unlocked.has('talker')) {
    newBadges.push(BADGES[1])
    unlocked.add('talker')
  }
  if (progress.sessions.some((s: any) => s.score !== null && s.score >= 95) && !unlocked.has('perfect')) {
    newBadges.push(BADGES[2])
    unlocked.add('perfect')
  }
  if (progress.streak >= 3 && !unlocked.has('streak_3')) {
    newBadges.push(BADGES[3])
    unlocked.add('streak_3')
  }
  const uniqueScenes = Object.keys(progress.sceneUsage).length
  if (uniqueScenes >= 5 && !unlocked.has('explorer')) {
    newBadges.push(BADGES[4])
    unlocked.add('explorer')
  }
  if (progress.sessions.some((s: any) => s.type === 'story') && !unlocked.has('storyteller')) {
    newBadges.push(BADGES[5])
    unlocked.add('storyteller')
  }
  if (progress.totalExports >= 3 && !unlocked.has('sound_collector')) {
    newBadges.push(BADGES[8])
    unlocked.add('sound_collector')
  }

  return newBadges
}
