import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import {
  calcBalances,
  calcTransfersFromBalances,
  formatIDR,
} from '../utils/calc'
import { calculateStreak, getBadge } from '../utils/streak'

const EMPTY = []

export default function Summary() {
  const { selectedGroup } = useApp()

  const members = selectedGroup?.members ?? EMPTY
  const targetAmount = Number(selectedGroup?.targetAmount)
  const hasTarget = Number.isFinite(targetAmount) && targetAmount > 0

  const totalSpent = useMemo(() => {
    const txs = selectedGroup?.transactions ?? EMPTY
    let sum = 0
    for (const tx of txs) {
      const amount = Number(tx?.amount)
      if (Number.isFinite(amount) && amount > 0) sum += amount
    }
    return sum
  }, [selectedGroup])

  const { balances, transfers } = useMemo(() => {
    if (!selectedGroup) return { balances: {}, transfers: [] }
    const b = calcBalances(selectedGroup)
    const t = calcTransfersFromBalances(b)
    return { balances: b, transfers: t }
  }, [selectedGroup])

  const memberById = useMemo(() => {
    const map = new Map()
    for (const m of members) map.set(m.id, m)
    return map
  }, [members])

  const streakRows = useMemo(() => {
    const txs = selectedGroup?.transactions ?? EMPTY

    const rows = members.map((m) => {
      const streak = calculateStreak(txs, m)
      return {
        memberId: m.id,
        name: m.name,
        streak,
        badge: getBadge(streak),
      }
    })

    rows.sort((a, b) => b.streak - a.streak || a.name.localeCompare(b.name))
    return rows
  }, [members, selectedGroup])

  if (!selectedGroup) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-sm text-slate-600">Ringkasan akan tampil di sini.</div>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Ringkasan</h3>
        <div className="text-xs text-slate-500">
          Mengabaikan transaksi yang berstatus lunas
        </div>
      </div>

      {hasTarget ? (
        <div className="mt-2 rounded-lg border border-slate-200 p-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-medium text-slate-700">Target grup</div>
            <div className="text-xs text-slate-600">
              Target: <span className="font-medium text-slate-900">{formatIDR(targetAmount)}</span> • Terpakai:{' '}
              <span className="font-medium text-slate-900">{formatIDR(totalSpent)}</span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-2 grid grid-cols-1 gap-2.5 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-2.5">
          <div className="text-xs font-semibold text-slate-800">Total hutang tiap orang</div>
          <ul className="mt-1.5 space-y-1.5">
            {members.length === 0 ? (
              <li className="text-sm text-slate-500">Belum ada anggota.</li>
            ) : null}

            {members.map((m) => {
              const bal = Number(balances[m.id] ?? 0)
              const owes = Math.max(0, -bal)
              const gets = Math.max(0, bal)

              let label = 'Seimbang'
              let pill = 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200'
              if (owes > 0.01) {
                label = `Berhutang ${formatIDR(owes)}`
                pill = 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200'
              }
              if (gets > 0.01) {
                label = `Dibayar ${formatIDR(gets)}`
                pill = 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200'
              }

              return (
                <li key={m.id} className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-slate-900">{m.name}</div>
                  <div className={"rounded-full px-2.5 py-1 text-xs font-semibold " + pill}>
                    {label}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-2.5">
          <div className="text-xs font-semibold text-slate-800">Siapa berhutang ke siapa</div>
          <ul className="mt-1.5 space-y-1.5">
            {transfers.length === 0 ? (
              <li className="text-sm text-slate-500">Tidak ada hutang yang tersisa.</li>
            ) : null}

            {transfers.map((t, idx) => {
              const from = memberById.get(t.fromMemberId)?.name ?? '-'
              const to = memberById.get(t.toMemberId)?.name ?? '-'
              return (
                <li
                  key={`${t.fromMemberId}-${t.toMemberId}-${idx}`}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="text-sm text-slate-700">
                    <span className="font-medium text-slate-900">{from}</span> →{' '}
                    <span className="font-medium text-slate-900">{to}</span>
                  </div>
                  <div className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-900 ring-1 ring-inset ring-indigo-200">
                    {formatIDR(t.amount)}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50/60 p-2.5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-800">Streak Pembayaran</div>
          <div className="text-xs text-slate-500">
            Dihitung dari transaksi lunas: paidDate ≤ dueDate
          </div>
        </div>

        <ul className="mt-1.5 space-y-1.5">
          {streakRows.length === 0 ? (
            <li className="text-sm text-slate-500">Belum ada anggota.</li>
          ) : null}

          {streakRows.map((r) => {
            const hot = r.streak >= 5
            const warm = r.streak >= 3
            const chip = hot
              ? 'bg-emerald-100 text-emerald-900 ring-emerald-200'
              : warm
                ? 'bg-sky-100 text-sky-900 ring-sky-200'
                : 'bg-slate-100 text-slate-800 ring-slate-200'
            return (
              <li key={r.memberId} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-medium text-slate-900">{r.name}</div>
                    {hot ? <span className="text-sm">🔥</span> : null}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">{r.badge}</div>
                </div>

                <div className={"shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset " + chip}>
                  {r.streak}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
