'use client'

import { deleteTransaction } from '@/app/actions/transactions'
import { useRouter } from 'next/navigation'

function formatEUR(n: number) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n)
}

interface Row {
  id: string
  amount: number
  type: 'income' | 'expense'
  description: string | null
  transaction_date: string
  categories: { name: string; icon: string } | null
}

export default function TransactionList({ transactions }: { transactions: Row[] }) {
  const router = useRouter()

  async function handleDelete(id: string) {
    await deleteTransaction(id)
    router.refresh()
  }

  if (transactions.length === 0) {
    return (
      <p className="text-sm text-ink/40 py-8 text-center">
        Nessun movimento registrato. Aggiungi il primo dal pannello a sinistra.
      </p>
    )
  }

  return (
    <div className="divide-y divide-line">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between py-3 group">
          <div className="flex items-center gap-3">
            <span className="text-base">{tx.categories?.icon ?? '•'}</span>
            <div>
              <p className="text-sm font-medium">
                {tx.description || tx.categories?.name || 'Movimento'}
              </p>
              <p className="text-xs text-ink/40">
                {new Date(tx.transaction_date).toLocaleDateString('it-IT', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`num text-sm font-medium ${
                tx.type === 'income' ? 'text-accent' : 'text-ink'
              }`}
            >
              {tx.type === 'income' ? '+' : '−'}{formatEUR(tx.amount)}
            </span>
            <button
              onClick={() => handleDelete(tx.id)}
              className="text-xs text-ink/0 group-hover:text-ink/40 hover:!text-danger transition-colors"
              aria-label="Elimina movimento"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
