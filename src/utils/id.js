export function newId(prefix) {
  const p = prefix ? `${prefix}-` : ''
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${p}${crypto.randomUUID()}`
  }

  // Fallback (low collision risk for local demo usage)
  return `${p}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
