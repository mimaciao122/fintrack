import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTransactions } from '@/app/actions/transactions'
import { getBudgetOverview, getCategories } from '@/app/actions/budgets'
import { signOut } from '@/app/actions/auth'
import TransactionForm from '@/components/TransactionForm'
import TransactionList from '@/components/TransactionList'
import BudgetCard from '@/components/BudgetCard'
import BudgetForm from '@/components/BudgetForm'

function formatEUR(n: number) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n)
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [transactions, budgets, categories] = await Promise.all([
    getTransactions(20),
    getBudgetOverview(),
    getCategories(),
  ])

  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance = income - expense

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-display text-xl">Saldo</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink/50">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="text-sm text-ink/50 hover:text-danger transition-colors">
                Esci
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Saldo generale */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-wide text-ink/40 mb-1">Saldo (ultimi movimenti)</p>
          <p className={`font-display text-5xl num ${balance >= 0 ? 'text-ink' : 'text-danger'}`}>
            {formatEUR(balance)}
          </p>
          <div className="flex gap-6 mt-2 text-sm">
            <span className="text-accent num">+{formatEUR(income)} entrate</span>
            <span className="text-ink/50 num">−{formatEUR(expense)} uscite</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonna sinistra: form */}
          <div className="space-y-8">
            <div className="border border-line bg-white rounded-lg p-5">
              <h2 className="font-display text-lg mb-4">Nuovo movimento</h2>
              <TransactionForm categories={categories} />
            </div>
            <div className="border border-line bg-white rounded-lg p-5">
              <h2 className="font-display text-lg mb-4">Imposta budget</h2>
              <BudgetForm categories={categories} />
            </div>
          </div>

          {/* Colonna centrale-destra: budget + lista */}
          <div className="lg:col-span-2 space-y-8">
            {budgets.length > 0 && (
              <div>
                <h2 className="font-display text-lg mb-4">Budget attivi</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {budgets.map((b) => (
                    <BudgetCard key={b.budget_id} budget={b} />
                  ))}
                </div>
              </div>
            )}

            <div className="border border-line bg-white rounded-lg p-5">
              <h2 className="font-display text-lg mb-2">Movimenti recenti</h2>
              <TransactionList transactions={transactions as any} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
