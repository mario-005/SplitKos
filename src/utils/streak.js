function toDateValue(iso) {
  if (!iso || typeof iso !== 'string') return null
  const d = new Date(iso)
  const t = d.getTime()
  return Number.isFinite(t) ? t : null
}

export function calculateStreak(transactions, user) {
  const userId = typeof user === 'string' ? user : user?.id
  if (!userId) return 0

  const txs = Array.isArray(transactions) ? transactions : []

  const relevant = txs
    .filter((tx) => {
      if (!tx || !tx.isSettled) return false
      const participants = tx.participantMemberIds
      if (!Array.isArray(participants) || !participants.includes(userId)) return false

      const due = toDateValue(tx.dueDateISO)
      const paid = toDateValue(tx.paidDateISO)
      if (due === null || paid === null) return false

      return true
    })
    // Sort by dueDate descending (terbaru -> lama)
    .sort((a, b) => {
      const ad = toDateValue(a.dueDateISO) ?? 0
      const bd = toDateValue(b.dueDateISO) ?? 0
      return bd - ad
    })

  if (relevant.length === 0) return 0

  let streak = 0
  for (const tx of relevant) {
    const due = toDateValue(tx.dueDateISO)
    const paid = toDateValue(tx.paidDateISO)

    if (due === null || paid === null) continue

    if (paid <= due) {
      streak += 1
    } else {
      break
    }
  }

  return streak
}

export function getBadge(streak) {
  const s = Number(streak)
  if (!Number.isFinite(s) || s <= 0) return '💀 Tukang Telat'
  if (s >= 5) return '🔥 Rajin Banget'
  if (s >= 3) return '👍 Lumayan'
  if (s >= 1) return '🙂 Baru Mulai'
  return '💀 Tukang Telat'
}
