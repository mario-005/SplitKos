export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 glass border-b-0 border-brand-200/50">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <div className="text-2xl font-black tracking-tighter text-brand-950 uppercase">
            SplitKos.
          </div>
          <div className="text-sm font-medium text-brand-500 tracking-tight mt-0.5">Catat & kelola patungan kos</div>
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-brand-400 bg-brand-100/50 px-3 py-1.5 rounded-full border border-brand-200/50">
          Local Storage
        </div>
      </div>
    </header>
  )
}
