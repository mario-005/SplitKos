import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import {
  calcBalances,
  calcTransfersFromBalances,
  formatIDR,
} from '../utils/calc'

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

  if (!selectedGroup) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-sm text-slate-600">Ringkasan akan tampil di sini.</div>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Ringkasan</h3>
        <div className="text-xs text-slate-500">
          Mengabaikan transaksi yang berstatus lunas
        </div>
      </div>

      {hasTarget ? (
        <div className="mt-3 rounded-lg border border-slate-200 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-medium text-slate-700">Target grup</div>
            <div className="text-xs text-slate-600">
              Target: <span className="font-medium text-slate-900">{formatIDR(targetAmount)}</span> • Terpakai:{' '}
              <span className="font-medium text-slate-900">{formatIDR(totalSpent)}</span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="text-xs font-medium text-slate-700">Total hutang tiap orang</div>
          <ul className="mt-2 space-y-2">
            {members.length === 0 ? (
              <li className="text-sm text-slate-500">Belum ada anggota.</li>
            ) : null}

            {members.map((m) => {
              const bal = Number(balances[m.id] ?? 0)
              const owes = Math.max(0, -bal)
              const gets = Math.max(0, bal)

              let label = 'Seimbang'
              let tone = 'text-slate-600'
              if (owes > 0.01) {
                label = `Berhutang ${formatIDR(owes)}`
                tone = 'text-amber-700'
              }
              if (gets > 0.01) {
                label = `Dibayar ${formatIDR(gets)}`
                tone = 'text-emerald-700'
              }

              return (
                <li key={m.id} className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-slate-900">{m.name}</div>
                  <div className={"text-sm font-medium " + tone}>{label}</div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 p-3">
          <div className="text-xs font-medium text-slate-700">Siapa berhutang ke siapa</div>
          <ul className="mt-2 space-y-2">
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
                  <div className="text-sm font-semibold text-slate-900">
                    {formatIDR(t.amount)}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
