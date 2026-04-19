const STORAGE_KEY = 'splitkos.state.v2'

const EMPTY_STATE_V1 = {
  selectedGroupId: null,
  groups: [],
}

export function loadAppState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredCloneSafe(EMPTY_STATE_V1)

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return structuredCloneSafe(EMPTY_STATE_V1)

    if (!Array.isArray(parsed.groups)) return structuredCloneSafe(EMPTY_STATE_V1)

    return {
      selectedGroupId:
        typeof parsed.selectedGroupId === 'string' ? parsed.selectedGroupId : null,
      groups: parsed.groups,
    }
  } catch {
    return structuredCloneSafe(EMPTY_STATE_V1)
  }
}

export function saveAppState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function structuredCloneSafe(value) {
  if (typeof structuredClone === 'function') return structuredClone(value)
  return JSON.parse(JSON.stringify(value))
}
