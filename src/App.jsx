import GroupList from './components/GroupList'
import Navbar from './components/Navbar'
import Summary from './components/Summary'
import TransactionList from './components/TransactionList'

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <GroupList />
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
              Tips: tandai transaksi <span className="font-medium">lunas</span> untuk
              mengeluarkannya dari perhitungan hutang.
            </div>
          </div>

          <div className="space-y-4">
            <TransactionList />
            <Summary />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
