export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div>
          <div className="text-lg font-semibold tracking-tight text-slate-900">
            SplitKos
          </div>
          <div className="text-xs text-slate-500">Catat & kelola patungan kos</div>
        </div>
        <div className="text-xs text-slate-500">Data tersimpan di localStorage</div>
      </div>
    </header>
  )
}
