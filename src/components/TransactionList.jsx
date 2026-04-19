import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatIDR } from '../utils/calc'
import Modal from './Modal'

const EMPTY = []

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function TransactionList() {
  const { selectedGroup, actions } = useApp()

  const [openMember, setOpenMember] = useState(false)
  const [memberName, setMemberName] = useState('')

  const [openTx, setOpenTx] = useState(false)
  const [editingTxId, setEditingTxId] = useState(null)
  const [txForm, setTxForm] = useState({
    paidByMemberId: '',
    amount: '',
    note: '',
    dateISO: todayISO(),
    isSettled: false,
  })

  const [openTarget, setOpenTarget] = useState(false)
  const [targetInput, setTargetInput] = useState('')

  const txs = selectedGroup?.transactions ?? EMPTY
  const stableMembers = selectedGroup?.members ?? EMPTY

  const targetAmount = Number(selectedGroup?.targetAmount)
  const hasTarget = Number.isFinite(targetAmount) && targetAmount > 0

  const totalSpent = useMemo(() => {
    let sum = 0
    for (const tx of txs) {
      const amount = Number(tx?.amount)
      if (Number.isFinite(amount) && amount > 0) sum += amount
    }
    return sum
  }, [txs])

  const targetPct = useMemo(() => {
    if (!hasTarget) return 0
    return Math.min(100, Math.max(0, (totalSpent / targetAmount) * 100))
  }, [hasTarget, totalSpent, targetAmount])

  const memberById = useMemo(() => {
    const map = new Map()
    for (const m of stableMembers) map.set(m.id, m)
    return map
  }, [stableMembers])

  function openAddTx() {
    const defaultPayer = stableMembers[0]?.id ?? ''
    setEditingTxId(null)
    setTxForm({
      paidByMemberId: defaultPayer,
      amount: '',
      note: '',
      dateISO: todayISO(),
      isSettled: false,
    })
    setOpenTx(true)
  }

  function openEditTx(tx) {
    setEditingTxId(tx.id)
    setTxForm({
      paidByMemberId: tx.paidByMemberId,
      amount: String(tx.amount ?? ''),
      note: tx.note ?? '',
      dateISO: tx.dateISO ?? todayISO(),
      isSettled: Boolean(tx.isSettled),
    })
    setOpenTx(true)
  }

  if (!selectedGroup) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-sm text-slate-600">Pilih atau buat grup dulu.</div>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{selectedGroup.name}</h2>
            <div className="text-xs text-slate-500">Anggota grup & transaksi</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
              onClick={() => {
                setTargetInput(hasTarget ? String(targetAmount) : '')
                setOpenTarget(true)
              }}
            >
              {hasTarget ? 'Edit Target' : 'Set Target'}
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
              onClick={() => setOpenMember(true)}
            >
              Tambah Anggota
            </button>
            <button
              type="button"
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              disabled={stableMembers.length === 0}
              onClick={openAddTx}
              title={stableMembers.length === 0 ? 'Tambah anggota dulu' : 'Tambah transaksi'}
            >
              Tambah Transaksi
            </button>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-slate-200 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-medium text-slate-700">Target grup</div>
            <div className="text-xs text-slate-500">
              {hasTarget ? (
                <>
                  Target: <span className="font-medium text-slate-900">{formatIDR(targetAmount)}</span>{' '}
                  • Terpakai: <span className="font-medium text-slate-900">{formatIDR(totalSpent)}</span>
                </>
              ) : (
                'Belum ada target'
              )}
            </div>
          </div>

          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-slate-900"
              style={{ width: hasTarget ? `${targetPct}%` : '0%' }}
              aria-hidden="true"
            />
          </div>

          {hasTarget ? (
            <div className="mt-2 text-xs text-slate-500">
              {targetPct.toFixed(0)}% dari target
            </div>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {stableMembers.length === 0 ? (
            <div className="text-sm text-slate-500">Belum ada anggota.</div>
          ) : null}
          {stableMembers.map((m) => (
            <span
              key={m.id}
              className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {m.name}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Transaksi</h3>
          <div className="text-xs text-slate-500">Klik Edit untuk ubah</div>
        </div>

        <ul className="mt-3 divide-y divide-slate-100">
          {txs.length === 0 ? (
            <li className="py-3 text-sm text-slate-500">Belum ada transaksi.</li>
          ) : null}

          {txs.map((tx) => {
            const payer = memberById.get(tx.paidByMemberId)
            return (
              <li key={tx.id} className="py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="truncate text-sm font-medium text-slate-900">
                        {tx.note || '(tanpa catatan)'}
                      </div>
                      <span
                        className={
                          'rounded-full px-2 py-0.5 text-xs font-medium ' +
                          (tx.isSettled
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700')
                        }
                      >
                        {tx.isSettled ? 'lunas' : 'belum lunas'}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span>
                        Dibayar: <span className="text-slate-700">{payer?.name ?? '-'}</span>
                      </span>
                      <span>
                        Tanggal: <span className="text-slate-700">{tx.dateISO ?? '-'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <div className="text-sm font-semibold text-slate-900">
                      {formatIDR(tx.amount)}
                    </div>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs hover:bg-slate-50"
                      onClick={() => openEditTx(tx)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs hover:bg-slate-50"
                      onClick={() => {
                        const ok = window.confirm('Hapus transaksi ini?')
                        if (!ok) return
                        actions.deleteTransaction(selectedGroup.id, tx.id)
                      }}
                    >
                      Hapus
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                      onClick={() =>
                        actions.updateTransaction(selectedGroup.id, tx.id, {
                          isSettled: !tx.isSettled,
                        })
                      }
                      title="Toggle lunas/belum lunas"
                    >
                      {tx.isSettled ? 'Belum' : 'Lunas'}
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <Modal
        open={openMember}
        title="Tambah Anggota"
        onClose={() => {
          setOpenMember(false)
          setMemberName('')
        }}
      >
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            actions.addMember(selectedGroup.id, memberName)
            setOpenMember(false)
            setMemberName('')
          }}
        >
          <label className="block">
            <div className="text-xs font-medium text-slate-700">Nama anggota</div>
            <input
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="Contoh: Andi"
              autoFocus
            />
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() => {
                setOpenMember(false)
                setMemberName('')
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Simpan
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={openTarget}
        title="Set Target Grup"
        onClose={() => {
          setOpenTarget(false)
          setTargetInput('')
        }}
      >
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            actions.setGroupTarget(selectedGroup.id, targetInput)
            setOpenTarget(false)
            setTargetInput('')
          }}
        >
          <label className="block">
            <div className="text-xs font-medium text-slate-700">Target total (IDR)</div>
            <input
              inputMode="numeric"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="Contoh: 2000000"
              autoFocus
            />
            <div className="mt-1 text-xs text-slate-500">
              Kosongkan atau isi 0 untuk menghapus target.
            </div>
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() => {
                setOpenTarget(false)
                setTargetInput('')
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Simpan
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={openTx}
        title={editingTxId ? 'Edit Transaksi' : 'Tambah Transaksi'}
        onClose={() => {
          setOpenTx(false)
          setEditingTxId(null)
        }}
      >
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (!txForm.paidByMemberId) return

            if (editingTxId) {
              actions.updateTransaction(selectedGroup.id, editingTxId, {
                paidByMemberId: txForm.paidByMemberId,
                amount: Number(txForm.amount),
                note: txForm.note,
                dateISO: txForm.dateISO,
                isSettled: txForm.isSettled,
              })
            } else {
              actions.addTransaction(selectedGroup.id, {
                paidByMemberId: txForm.paidByMemberId,
                amount: Number(txForm.amount),
                note: txForm.note,
                dateISO: txForm.dateISO,
                isSettled: txForm.isSettled,
              })
            }

            setOpenTx(false)
            setEditingTxId(null)
          }}
        >
          <label className="block">
            <div className="text-xs font-medium text-slate-700">Siapa bayar</div>
            <select
              value={txForm.paidByMemberId}
              onChange={(e) =>
                setTxForm((p) => ({ ...p, paidByMemberId: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            >
              <option value="" disabled>
                Pilih anggota
              </option>
              {stableMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <div className="text-xs font-medium text-slate-700">Jumlah (IDR)</div>
            <input
              inputMode="numeric"
              value={txForm.amount}
              onChange={(e) => setTxForm((p) => ({ ...p, amount: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="Contoh: 150000"
            />
            <div className="mt-1 text-xs text-slate-500">
              Catatan: transaksi dibagi rata ke semua anggota grup.
            </div>
          </label>

          <label className="block">
            <div className="text-xs font-medium text-slate-700">Untuk apa</div>
            <input
              value={txForm.note}
              onChange={(e) => setTxForm((p) => ({ ...p, note: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="Contoh: Belanja bulanan"
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <div className="text-xs font-medium text-slate-700">Tanggal</div>
              <input
                type="date"
                value={txForm.dateISO}
                onChange={(e) =>
                  setTxForm((p) => ({ ...p, dateISO: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
              <input
                type="checkbox"
                checked={txForm.isSettled}
                onChange={(e) =>
                  setTxForm((p) => ({ ...p, isSettled: e.target.checked }))
                }
              />
              <span className="text-sm text-slate-700">Lunas</span>
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() => {
                setOpenTx(false)
                setEditingTxId(null)
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Simpan
            </button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
