import GroupList from './components/GroupList'
import Navbar from './components/Navbar'
import Summary from './components/Summary'
import TransactionList from './components/TransactionList'

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-3 py-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[300px_1fr]">
          <div className="space-y-3">
            <GroupList />
            <div className="rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-600">
              Tips: tandai transaksi <span className="font-medium">lunas</span> untuk
              mengeluarkannya dari perhitungan hutang.
            </div>
          </div>

          <div className="space-y-3">
            <TransactionList />
            <Summary />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
