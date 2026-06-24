import type { ChatLLM } from '../../api/chat'
import type { GeneratedContent, ContentType } from '../../types/dialogue'
import { getDialoguePrompt, getStoryPrompt, getRecommendPrompt } from '../../utils/prompts'

export interface RecommendationResult {
  recommended_type: ContentType
  reason: string
}

export async function recommendType(
  llm: ChatLLM,
  input: string,
): Promise<RecommendationResult> {
  const messages = [
    { role: 'system' as const, content: '你是英语学习助手，帮助判断最适合的学习内容形式。只返回JSON。' },
    { role: 'user' as const, content: getRecommendPrompt(input) },
  ]
  const result = await llm.chatJSON<RecommendationResult>(messages)
  if (result) return result
  return { recommended_type: 'dialogue', reason: '默认推荐对话形式' }
}

export async function generateContent(
  llm: ChatLLM,
  input: string,
  type: ContentType,
  scene: string,
  difficulty: string,
): Promise<GeneratedContent> {
  const messages = [
    { role: 'system' as const, content: '你是专业的英语教师。只返回JSON。' },
    { role: 'user' as const, content: type === 'dialogue'
      ? getDialoguePrompt(input, scene, difficulty)
      : getStoryPrompt(input, difficulty)
    },
  ]
  const result = await llm.chatJSON<Omit<GeneratedContent, 'id' | 'createdAt'>>(messages)
  if (!result) {
    throw new Error('AI 生成失败，请重试')
  }
  return {
    ...result,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  }
}
