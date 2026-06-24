// Chat and TTS are now completely separated into independent modules.
// This file re-exports both for backward compatibility.

export { ChatLLM, createChatLLM, parseJSON } from '../chat/index'
export { TTSLLM, createTTSLLM } from '../tts/index'

// Backward-compat aliases
import { createChatLLM, ChatLLM } from '../chat/index'
export const createLLM = createChatLLM
export type LLMAdapter = Pick<ChatLLM, 'chatJSON' | 'chat'>

export type { ChatMessage, LLMConfig } from '../../types/llm'
