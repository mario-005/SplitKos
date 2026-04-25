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

    const next = {
      selectedGroupId:
        typeof parsed.selectedGroupId === 'string' ? parsed.selectedGroupId : null,
      groups: parsed.groups,
    }

    // Lightweight migration to ensure required fields exist
    next.groups = (next.groups ?? []).map((g) => {
      const members = Array.isArray(g?.members) ? g.members : []
      const memberIds = members.map((m) => m.id).filter(Boolean)
      const transactions = Array.isArray(g?.transactions) ? g.transactions : []

      return {
        targetAmount: g?.targetAmount ?? null,
        ...g,
        members,
        transactions: transactions.map((tx) => {
          const dueDateISO = tx?.dueDateISO ?? tx?.dateISO ?? ''
          const paidDateISO =
            tx?.paidDateISO ?? (tx?.isSettled ? tx?.dateISO ?? dueDateISO : '')

          const participantMemberIds = Array.isArray(tx?.participantMemberIds)
            ? tx.participantMemberIds
            : memberIds

          return {
            ...tx,
            dueDateISO,
            paidDateISO,
            participantMemberIds,
          }
        }),
      }
    })

    return next
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
