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
      <section className="glass-card rounded-2xl p-8 flex items-center justify-center min-h-[200px]">
        <div className="text-base font-medium text-brand-500 text-center">
          Pilih grup untuk melihat ringkasan.<br/>
          <span className="text-xs text-brand-400 mt-2 block">Ringkasan akan tampil di sini.</span>
        </div>
      </section>
    )
  }

  return (
    <section className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black tracking-tight text-brand-950 uppercase">Ringkasan</h3>
        <div className="text-xs font-semibold text-brand-400 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
          Mengabaikan transaksi berstatus lunas
        </div>
      </div>

      {hasTarget ? (
        <div className="mb-6 rounded-xl border-l-4 border-l-brand-900 border-y border-r border-brand-200 bg-brand-50/50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs font-bold uppercase tracking-wider text-brand-600">Target Grup</div>
            <div className="text-sm font-medium text-brand-600 flex flex-wrap items-center gap-2">
              <span className="bg-white px-2 py-1 rounded-md border border-brand-200 shadow-sm">Target: <span className="font-bold text-brand-950 ml-1">{formatIDR(targetAmount)}</span></span> 
              <span className="text-brand-300">•</span>
              <span className="bg-white px-2 py-1 rounded-md border border-brand-200 shadow-sm">Terpakai: <span className="font-bold text-brand-950 ml-1">{formatIDR(totalSpent)}</span></span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-brand-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-4">Total hutang tiap orang</div>
          <ul className="space-y-3">
            {members.length === 0 ? (
              <li className="text-sm font-medium text-brand-400 text-center py-2">Belum ada anggota.</li>
            ) : null}

            {members.map((m) => {
              const bal = Number(balances[m.id] ?? 0)
              const owes = Math.max(0, -bal)
              const gets = Math.max(0, bal)

              let label = 'Seimbang'
              let pill = 'bg-brand-50 text-brand-700 border border-brand-200'
              if (owes > 0.01) {
                label = `Berhutang ${formatIDR(owes)}`
                pill = 'bg-rose-50 text-rose-700 border border-rose-200'
              }
              if (gets > 0.01) {
                label = `Dibayar ${formatIDR(gets)}`
                pill = 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }

              return (
                <li key={m.id} className="flex items-center justify-between gap-3 border-b border-brand-50 pb-3 last:border-0 last:pb-0">
                  <div className="text-sm font-bold text-brand-900">{m.name}</div>
                  <div className={"rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide " + pill}>
                    {label}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="rounded-xl border border-brand-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-4">Siapa berhutang ke siapa</div>
          <ul className="space-y-3">
            {transfers.length === 0 ? (
              <li className="text-sm font-medium text-brand-400 text-center py-2">Tidak ada hutang tersisa.</li>
            ) : null}

            {transfers.map((t, idx) => {
              const from = memberById.get(t.fromMemberId)?.name ?? '-'
              const to = memberById.get(t.toMemberId)?.name ?? '-'
              const waText = encodeURIComponent(`Halo ${from}, ini pengingat tagihan patungan dari grup *${selectedGroup.name}* ya. Kamu ada tagihan sebesar *${formatIDR(t.amount)}* untuk dibayarkan ke ${to}. Yuk segera dilunasi! 🙏`)
              const waLink = `https://wa.me/?text=${waText}`

              return (
                <li
                  key={`${t.fromMemberId}-${t.toMemberId}-${idx}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-50 pb-3 last:border-0 last:pb-0"
                >
                  <div className="text-sm font-medium text-brand-500 flex items-center gap-2">
                    <span className="font-bold text-brand-900">{from}</span> 
                    <span className="text-brand-300">→</span> 
                    <span className="font-bold text-brand-900">{to}</span>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <div className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 border border-indigo-100 shadow-sm">
                      {formatIDR(t.amount)}
                    </div>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-emerald-500 text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-600 transition-all hover:-translate-y-0.5 shadow-sm flex items-center gap-1"
                      title="Kirim tagihan via WhatsApp"
                    >
                      💬 Tagih WA
                    </a>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-brand-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-600">Streak Pembayaran</div>
          <div className="text-[10px] font-semibold text-brand-400 bg-brand-50 px-2 py-1 rounded">
            paidDate ≤ dueDate
          </div>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {streakRows.length === 0 ? (
            <li className="text-sm font-medium text-brand-400">Belum ada anggota.</li>
          ) : null}

          {streakRows.map((r) => {
            const hot = r.streak >= 5
            const warm = r.streak >= 3
            const chip = hot
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/30'
              : warm
                ? 'bg-gradient-to-br from-sky-400 to-sky-600 text-white shadow-sky-500/30'
                : 'bg-brand-100 text-brand-700 border border-brand-200'
            return (
              <li key={r.memberId} className="flex items-center justify-between gap-3 bg-brand-50/50 p-3 rounded-xl border border-brand-50">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-bold text-brand-900">{r.name}</div>
                    {hot ? <span className="text-base drop-shadow-sm">🔥</span> : null}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-brand-500">{r.badge}</div>
                </div>

                <div className={"shrink-0 rounded-xl px-3 py-1.5 text-sm font-black shadow-sm " + chip}>
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
