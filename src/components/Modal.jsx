export default function Modal({ open, title, children, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-brand-950/40 backdrop-blur-sm"
        aria-label="Tutup"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl rounded-3xl bg-[#f8fafc] p-6 sm:p-8 shadow-2xl ring-1 ring-brand-200/50">
        <div className="flex items-start justify-between gap-3 border-b border-brand-100 pb-4 mb-6">
          <h2 className="text-2xl font-black text-brand-950 tracking-tight">{title}</h2>
          <button
            type="button"
            className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-500 hover:bg-brand-100 transition-colors"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}
