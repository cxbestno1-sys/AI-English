const PREFIX = 'speaknow_'

export function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function set<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    console.warn('localStorage write failed')
  }
}

export function remove(key: string): void {
  localStorage.removeItem(PREFIX + key)
}

// Conversation history
export function getHistory(): import('../types/dialogue').GeneratedContent[] {
  return get('history', [])
}

export function addHistory(content: import('../types/dialogue').GeneratedContent): void {
  const history = getHistory()
  history.unshift(content)
  // Keep last 50
  if (history.length > 50) history.splice(50)
  set('history', history)
}

export function removeFromHistory(id: string): void {
  const history = getHistory().filter(c => c.id !== id)
  set('history', history)
}
