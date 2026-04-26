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
    <section className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-bold tracking-tight text-brand-950">Grup</h2>
        <button
          type="button"
          className="rounded-full bg-brand-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
          onClick={() => setOpen(true)}
        >
          Buat Grup
        </button>
      </div>

      <ul className="space-y-2">
        {groups.length === 0 ? (
          <li className="rounded-xl border border-dashed border-brand-200 p-4 text-center text-sm font-medium text-brand-500">
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
                  'w-full rounded-xl px-4 py-3 text-left transition-all duration-300 ' +
                  (active
                    ? 'bg-brand-900 text-white shadow-md transform scale-[1.02]'
                    : 'bg-transparent text-brand-900 hover:bg-brand-50 border border-transparent hover:border-brand-100')
                }
              >
                <div className={`text-base font-bold ${active ? 'text-white' : 'text-brand-900'}`}>{g.name}</div>
                <div className={`mt-1 text-xs font-medium ${active ? 'text-brand-200' : 'text-brand-500'}`}>
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
            <div className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">Nama grup</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-brand-200 bg-brand-50/50 px-4 py-3 text-sm font-medium text-brand-900 outline-none focus:border-brand-500 focus:bg-white transition-colors"
              placeholder="Contoh: Kos A, Trip Bali"
              autoFocus
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-brand-600 hover:bg-brand-50 transition-colors"
              onClick={() => {
                setOpen(false)
                setName('')
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Simpan
            </button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
