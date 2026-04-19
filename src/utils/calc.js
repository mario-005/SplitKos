function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export function formatIDR(amount) {
  const safe = Number.isFinite(amount) ? amount : 0
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(safe)
}

export function calcBalances(group) {
  const members = group?.members ?? []
  const txs = group?.transactions ?? []
  const memberCount = members.length

  const balances = {}
  for (const m of members) balances[m.id] = 0

  if (memberCount === 0) return balances

  for (const tx of txs) {
    if (!tx || tx.isSettled) continue

    const amount = Number(tx.amount)
    if (!Number.isFinite(amount) || amount <= 0) continue

    const payerId = tx.paidByMemberId
    if (!payerId || !(payerId in balances)) continue

    const share = amount / memberCount

    for (const m of members) {
      balances[m.id] = round2(balances[m.id] - share)
    }
    balances[payerId] = round2(balances[payerId] + amount)
  }

  return balances
}

export function calcTransfersFromBalances(balances) {
  const creditors = []
  const debtors = []

  for (const [memberId, balRaw] of Object.entries(balances ?? {})) {
    const bal = Number(balRaw)
    if (!Number.isFinite(bal)) continue
    if (bal > 0.01) creditors.push({ memberId, amount: bal })
    if (bal < -0.01) debtors.push({ memberId, amount: -bal })
  }

  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const transfers = []
  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i]
    const c = creditors[j]

    const pay = Math.min(d.amount, c.amount)
    const payR = round2(pay)

    if (payR > 0) {
      transfers.push({
        fromMemberId: d.memberId,
        toMemberId: c.memberId,
        amount: payR,
      })
    }

    d.amount = round2(d.amount - pay)
    c.amount = round2(c.amount - pay)

    if (d.amount <= 0.01) i++
    if (c.amount <= 0.01) j++
  }

  return transfers
}
