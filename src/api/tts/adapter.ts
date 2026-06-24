import type { LLMConfig } from '../../types/llm'

/** Build MiMo TTS request body using chat completions format.
 *  MiMo TTS is accessed through /v1/chat/completions (not /v1/audio/speech).
 *  The body must include `messages` (required by the chat completions endpoint)
 *  and `modalities: ["audio"]` to request audio output. */
export function buildTTSBody(config: LLMConfig, text: string, voice = 'Chloe', speed = 1.0): object {
  return {
    model: config.ttsModel,
    messages: [
      {
        role: 'user',
        content: text,
      },
      {
        role: 'assistant',
        content: text,
      },
    ],
    modalities: ['audio'],
    audio: { voice, speed, format: 'wav' },
  }
}

/** Fetch through the dedicated TTS proxy (Node server forwards to upstream, handles CORS). */
export async function fetchTTSProxy(
  url: string, headers: Record<string, string>, body: object,
): Promise<Response> {
  return fetch('/api/tts-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: url, headers, body }),
  })
}
