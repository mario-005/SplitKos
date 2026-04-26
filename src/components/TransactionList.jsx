import { useMemo, useState } from 'react'
import confetti from 'canvas-confetti'
import { useApp } from '../context/AppContext'
import { formatIDR } from '../utils/calc'
import Modal from './Modal'

const EMPTY = []

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function uniq(arr) {
  return Array.from(new Set(arr))
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
    dueDateISO: todayISO(),
    paidDateISO: '',
    participantMemberIds: [],
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
      dueDateISO: todayISO(),
      paidDateISO: '',
      participantMemberIds: stableMembers.map((m) => m.id),
      isSettled: false,
    })
    setOpenTx(true)
  }

  function openEditTx(tx) {
    setEditingTxId(tx.id)
    const fallbackParticipants = stableMembers.map((m) => m.id)
    setTxForm({
      paidByMemberId: tx.paidByMemberId,
      amount: String(tx.amount ?? ''),
      note: tx.note ?? '',
      dateISO: tx.dateISO ?? todayISO(),
      dueDateISO: tx.dueDateISO ?? tx.dateISO ?? todayISO(),
      paidDateISO: tx.paidDateISO ?? (tx.isSettled ? tx.dateISO ?? '' : ''),
      participantMemberIds: Array.isArray(tx.participantMemberIds)
        ? tx.participantMemberIds
        : fallbackParticipants,
      isSettled: Boolean(tx.isSettled),
    })
    setOpenTx(true)
  }

  if (!selectedGroup) {
    return (
      <section className="glass-card rounded-2xl p-8 flex items-center justify-center min-h-[200px]">
        <div className="text-base font-medium text-brand-500">Pilih atau buat grup dulu.</div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-brand-950 uppercase tracking-tight">{selectedGroup.name}</h2>
            <div className="text-sm font-semibold text-brand-400">Anggota grup & transaksi</div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-full border border-brand-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-600 hover:bg-brand-50 transition-colors shadow-sm"
              onClick={() => {
                setTargetInput(hasTarget ? String(targetAmount) : '')
                setOpenTarget(true)
              }}
            >
              {hasTarget ? 'Edit Target' : 'Set Target'}
            </button>
            <button
              type="button"
              className="rounded-full border border-brand-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-600 hover:bg-brand-50 transition-colors shadow-sm"
              onClick={() => setOpenMember(true)}
            >
              Tambah Anggota
            </button>
            <button
              type="button"
              className="rounded-full bg-brand-900 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-800 disabled:opacity-50 transition-all hover:shadow-lg hover:-translate-y-0.5"
              disabled={stableMembers.length === 0}
              onClick={openAddTx}
              title={stableMembers.length === 0 ? 'Tambah anggota dulu' : 'Tambah transaksi'}
            >
              Tambah Transaksi
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50/50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="text-xs font-bold uppercase tracking-wider text-brand-600">Progress Target</div>
            <div className="text-xs font-semibold text-brand-500">
              {hasTarget ? (
                <>
                  Target: <span className="text-brand-900">{formatIDR(targetAmount)}</span>{' '}
                  <span className="text-brand-300 mx-1">•</span> Terpakai: <span className="text-brand-900">{formatIDR(totalSpent)}</span>
                </>
              ) : (
                'Belum ada target'
              )}
            </div>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-brand-200/50">
            <div
              className="h-full bg-brand-900 rounded-full transition-all duration-1000 ease-out"
              style={{ width: hasTarget ? `${targetPct}%` : '0%' }}
              aria-hidden="true"
            />
          </div>

          {hasTarget ? (
            <div className="mt-2 text-[11px] font-bold text-brand-400 text-right">
              {targetPct.toFixed(0)}% TERPENUHI
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {stableMembers.length === 0 ? (
            <div className="text-sm font-medium text-brand-400">Belum ada anggota.</div>
          ) : null}
          {stableMembers.map((m) => (
            <span
              key={m.id}
              className="inline-flex items-center rounded-full bg-white border border-brand-200 shadow-sm px-3 py-1 text-xs font-bold text-brand-700"
            >
              {m.name}
            </span>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4 border-b border-brand-100 pb-4">
          <h3 className="text-xl font-black uppercase tracking-tight text-brand-950">Transaksi</h3>
          <div className="text-xs font-semibold text-brand-400">Klik Edit untuk ubah</div>
        </div>

        <ul className="divide-y divide-brand-100">
          {txs.length === 0 ? (
            <li className="py-8 text-center text-sm font-medium text-brand-400">Belum ada transaksi.</li>
          ) : null}

          {txs.map((tx) => {
            const payer = memberById.get(tx.paidByMemberId)
            return (
              <li key={tx.id} className="py-4 hover:bg-brand-50/50 transition-colors -mx-4 px-4 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <div className="text-lg font-bold text-brand-900 truncate">
                        {tx.note || '(tanpa catatan)'}
                      </div>
                      <span
                        className={
                          'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ' +
                          (tx.isSettled
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-amber-50 border-amber-200 text-amber-700')
                        }
                      >
                        {tx.isSettled ? 'lunas' : 'belum lunas'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-brand-400">
                      <span>
                        Oleh: <span className="text-brand-700">{payer?.name ?? '-'}</span>
                      </span>
                      <span>
                        Tgl: <span className="text-brand-700">{tx.dateISO ?? '-'}</span>
                      </span>
                      <span className="bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">
                        Due: <span className="text-brand-700">{tx.dueDateISO ?? '-'}</span>
                      </span>
                      {tx.isSettled && (
                        <span className="bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 text-emerald-700">
                          Paid: {tx.paidDateISO ?? '-'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    <div className="text-xl font-black text-brand-950">
                      {formatIDR(tx.amount)}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-bold text-brand-600 hover:bg-brand-50 transition-colors shadow-sm"
                        onClick={() => openEditTx(tx)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors shadow-sm"
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
                        className={"rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm transition-all " + (tx.isSettled ? "bg-brand-100 text-brand-600 border border-brand-200 hover:bg-brand-200" : "bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-md hover:-translate-y-0.5")}
                        onClick={() => {
                          if (!tx.isSettled) {
                            confetti({
                              particleCount: 100,
                              spread: 70,
                              origin: { y: 0.6 },
                              colors: ['#10b981', '#34d399', '#059669']
                            })
                          }
                          actions.updateTransaction(selectedGroup.id, tx.id, {
                            isSettled: !tx.isSettled,
                          })
                        }}
                        title="Toggle lunas/belum lunas"
                      >
                        {tx.isSettled ? 'Batalkan' : 'Lunasi'}
                      </button>
                    </div>
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
          className="space-y-2.5"
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
          className="space-y-2.5"
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
          className="space-y-2.5"
          onSubmit={(e) => {
            e.preventDefault()
            if (!txForm.paidByMemberId) return
            if (!Array.isArray(txForm.participantMemberIds) || txForm.participantMemberIds.length === 0) return
            if (!txForm.dueDateISO) return
            if (txForm.isSettled && !txForm.paidDateISO) return

            if (editingTxId) {
              actions.updateTransaction(selectedGroup.id, editingTxId, {
                paidByMemberId: txForm.paidByMemberId,
                amount: Number(txForm.amount),
                note: txForm.note,
                dateISO: txForm.dateISO,
                dueDateISO: txForm.dueDateISO,
                paidDateISO: txForm.isSettled ? txForm.paidDateISO : '',
                participantMemberIds: txForm.participantMemberIds,
                isSettled: txForm.isSettled,
              })
            } else {
              actions.addTransaction(selectedGroup.id, {
                paidByMemberId: txForm.paidByMemberId,
                amount: Number(txForm.amount),
                note: txForm.note,
                dateISO: txForm.dateISO,
                dueDateISO: txForm.dueDateISO,
                paidDateISO: txForm.isSettled ? txForm.paidDateISO : '',
                participantMemberIds: txForm.participantMemberIds,
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
              Catatan: transaksi dibagi rata ke anggota yang dipilih di “Yang ikut”.
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

            <label className="block">
              <div className="text-xs font-medium text-slate-700">Jatuh tempo (dueDate)</div>
              <input
                type="date"
                value={txForm.dueDateISO}
                onChange={(e) =>
                  setTxForm((p) => ({ ...p, dueDateISO: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              />
            </label>
          </div>

          <label className="block">
            <div className="text-xs font-medium text-slate-700">Participants</div>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {stableMembers.map((m) => {
                const checked = (txForm.participantMemberIds ?? []).includes(m.id)
                return (
                  <label
                    key={m.id}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? uniq([...(txForm.participantMemberIds ?? []), m.id])
                          : (txForm.participantMemberIds ?? []).filter((id) => id !== m.id)
                        setTxForm((p) => ({ ...p, participantMemberIds: next }))
                      }}
                    />
                    <span className="text-sm text-slate-700">{m.name}</span>
                  </label>
                )
              })}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Wajib pilih minimal 1 participant.
            </div>
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
              <input
                type="checkbox"
                checked={txForm.isSettled}
                onChange={(e) => {
                  const checked = e.target.checked
                  setTxForm((p) => ({
                    ...p,
                    isSettled: checked,
                    paidDateISO: checked ? p.paidDateISO || todayISO() : '',
                  }))
                }}
              />
              <span className="text-sm text-slate-700">Lunas</span>
            </label>

            <label className="block">
              <div className="text-xs font-medium text-slate-700">Tanggal dibayar (paidDate)</div>
              <input
                type="date"
                value={txForm.paidDateISO}
                onChange={(e) =>
                  setTxForm((p) => ({ ...p, paidDateISO: e.target.value }))
                }
                disabled={!txForm.isSettled}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-400"
              />
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
