import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Modal from './Modal'

const EMPTY = []

export default function GroupList() {
  const { state, selectedGroup, actions } = useApp()
  const groups = state.groups ?? EMPTY

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  const selectedId = selectedGroup?.id ?? null

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900">Grup</h2>
        <button
          type="button"
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
          onClick={() => setOpen(true)}
        >
          Buat Grup
        </button>
      </div>

      <ul className="mt-3 space-y-2">
        {groups.length === 0 ? (
          <li className="rounded-lg border border-dashed border-slate-200 p-3 text-sm text-slate-500">
            Belum ada grup.
          </li>
        ) : null}

        {groups.map((g) => {
          const active = g.id === selectedId
          return (
            <li key={g.id}>
              <button
                type="button"
                onClick={() => actions.selectGroup(g.id)}
                className={
                  'w-full rounded-lg border px-3 py-2 text-left transition ' +
                  (active
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 hover:bg-slate-50')
                }
              >
                <div className="text-sm font-medium text-slate-900">{g.name}</div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {(g.members?.length ?? 0)} anggota • {(g.transactions?.length ?? 0)} transaksi
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      <Modal
        open={open}
        title="Buat Grup Patungan"
        onClose={() => {
          setOpen(false)
          setName('')
        }}
      >
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            actions.createGroup(name)
            setOpen(false)
            setName('')
          }}
        >
          <label className="block">
            <div className="text-xs font-medium text-slate-700">Nama grup</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="Contoh: Kos A, Trip Bali"
              autoFocus
            />
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() => {
                setOpen(false)
                setName('')
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
