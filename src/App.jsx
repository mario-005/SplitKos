import GroupList from './components/GroupList'
import Navbar from './components/Navbar'
import Summary from './components/Summary'
import TransactionList from './components/TransactionList'

function App() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr]">
          <div className="space-y-8">
            <GroupList />
            <div className="glass-card rounded-2xl p-5 text-sm text-brand-600 transition-transform hover:scale-[1.02] duration-300">
              <span className="font-bold text-brand-900 block mb-1">💡 Pro Tip:</span> 
              Tandai transaksi <span className="font-bold text-brand-900 px-1.5 py-0.5 bg-brand-100 rounded-md">lunas</span> untuk
              mengeluarkannya dari perhitungan hutang otomatis.
            </div>
          </div>

          <div className="space-y-8">
            <TransactionList />
            <Summary />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
