export interface DialogueLine {
  speaker: string
  english: string
  chinese: string
}

export interface StoryLine {
  narrator: string
  english: string
  chinese: string
}

export type Line = DialogueLine | StoryLine

export type ContentType = 'dialogue' | 'story'

export interface GeneratedContent {
  id: string
  title: string
  type: ContentType
  keywords: string[]
  lines: Line[]
  createdAt: number
}

export interface ScoreResult {
  score: number
  matched_words: string[]
  missing_words: string[]
  wrong_words: { expected: string; said: string }[]
  feedback: string
  tips: string[]
}

export interface LearnSession {
  contentId: string
  contentTitle: string
  type: ContentType
  lineIndex: number
  english: string
  chinese: string
  score: number | null
  timestamp: number
}
