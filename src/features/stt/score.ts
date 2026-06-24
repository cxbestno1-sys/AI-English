import type { LLMAdapter } from '../../api/llm'
import { getScorePrompt } from '../../utils/prompts'
import type { ScoreResult } from '../../types/dialogue'

export async function scorePronunciation(
  llm: LLMAdapter,
  target: string,
  userSaid: string,
): Promise<ScoreResult> {
  const messages = [
    { role: 'system' as const, content: '你是英语发音教师。仔细对比用户的发音和原句，给出建设性反馈。只返回JSON。' },
    { role: 'user' as const, content: getScorePrompt(target, userSaid) },
  ]
  const result = await llm.chatJSON<ScoreResult>(messages)
  if (result) {
    result.score = Math.max(0, Math.min(100, result.score))
    return result
  }

  // Fallback: simple word comparison
  const targetWords = target.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w)
  const saidWords = userSaid.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w)
  const matched = targetWords.filter(w => saidWords.includes(w))
  const missing = targetWords.filter(w => !saidWords.includes(w) && w.length > 2)
  const score = Math.round((matched.length / Math.max(targetWords.length, 1)) * 100)

  return {
    score,
    matched_words: matched,
    missing_words: missing,
    wrong_words: [],
    feedback: score >= 80 ? '很好！继续加油！' : '差一点，再试一次！',
    tips: ['多听几遍原句，注意每个词的发音'],
  }
}
