import type { ContentType } from '../types/dialogue'

export const SCENES = [
  { id: 'daily', name: '日常', icon: '\u2600\uFE0F' },
  { id: 'travel', name: '旅行', icon: '\u2708\uFE0F' },
  { id: 'business', name: '商务', icon: '\uD83D\uDCBC' },
  { id: 'campus', name: '校园', icon: '\uD83C\uDF93' },
  { id: 'shopping', name: '购物', icon: '\uD83D\uDECD\uFE0F' },
  { id: 'dining', name: '餐饮', icon: '\uD83C\uDF7D' },
  { id: 'medical', name: '就医', icon: '\uD83C\uDFE5' },
  { id: 'greeting', name: '问候', icon: '\uD83D\uDC4B' },
  { id: 'social', name: '社交', icon: '\uD83C\uDF89' },
  { id: 'emergency', name: '应急', icon: '\uD83D\uDD30' },
] as const

export const DIFFICULTIES = [
  { id: 'beginner', name: '初级', level: 'A1-A2' },
  { id: 'intermediate', name: '中级', level: 'B1-B2' },
  { id: 'advanced', name: '高级', level: 'C1-C2' },
] as const

export function getRecommendPrompt(input: string): string {
  return `根据用户输入的内容，判断最适合的英语学习形式。

输入: "${input}"

返回JSON格式：
{
  "recommended_type": "dialogue" or "story",
  "reason": "用中文简短说明原因，15字以内"
}

判断依据:
- 单个单词 or 名词短语 -> 对话
- 一句话 or 完整句子 -> 故事
- 多个相关短语 -> 对话
- 抽象概念 -> 故事`
}

export function getDialoguePrompt(input: string, scene: string, difficulty: string): string {
  return `你是专业的英语教师。根据用户输入的内容，生成一段${scene}场景的英语对话。

输入内容: "${input}"
难度: ${difficulty === 'beginner' ? '初级 (A1-A2) - 使用简单词汇和短句' : difficulty === 'intermediate' ? '中级 (B1-B2) - 使用日常表达' : '高级 (C1-C2) - 使用复杂句式'}

要求:
1. 包含用户输入的所有关键词
2. 每句对话包含英文和中文翻译
3. 1-4轮对话（2-8句话）
4. 对话自然、实用

返回JSON格式：
{
  "title": "场景标题",
  "keywords": ["keyword1", "keyword2"],
  "lines": [
    { "speaker": "角色名", "english": "英文", "chinese": "中文" }
  ]
}`
}

export function getStoryPrompt(input: string, difficulty: string): string {
  return `你是专业的英语教师。根据用户输入的内容，创作一篇英语小故事。

输入内容: "${input}"
难度: ${difficulty === 'beginner' ? '初级 (A1-A2) - 使用简单词汇和短句，每段2-3句' : difficulty === 'intermediate' ? '中级 (B1-B2) - 每段3-4句' : '高级 (C1-C2) - 每段4-5句'}

要求:
1. 围绕用户输入的内容展开
2. 每段包含英文和中文翻译
3. 3-6个段落
4. 有趣、有画面感

返回JSON格式：
{
  "title": "故事标题",
  "keywords": ["keyword1", "keyword2"],
  "lines": [
    { "narrator": "旁白", "english": "英文", "chinese": "中文" }
  ]
}`
}

export function getScorePrompt(target: string, userSaid: string): string {
  return `对比用户的发音识别结果和目标句子，评估发音准确度。

目标句子: "${target}"
识别结果: "${userSaid}"

返回JSON格式：
{
  "score": 0 to 100,
  "matched_words": ["correct words"],
  "missing_words": ["missing words"],
  "wrong_words": [{"expected": "word", "said": "user word"}],
  "feedback": "Chinese feedback, 20 chars max",
  "tips": ["pronunciation tips"]
}`
}
