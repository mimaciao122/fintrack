'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTransaction } from '@/app/actions/transactions'
import type { Category, TransactionType } from '@/types'

export default function TransactionForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [type, setType] = useState<TransactionType>('expense')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filtered = categories.filter((c) => c.type === type)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    try {
      await createTransaction({
        category_id: (formData.get('category_id') as string) || null,
        amount: parseFloat(formData.get('amount') as string),
        type,
        description: (formData.get('description') as string) || null,
        transaction_date: formData.get('transaction_date') as string,
      })
      router.refresh()
      ;(document.getElementById('tx-form') as HTMLFormElement)?.reset()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore imprevisto')
    } finally {
      setPending(false)
    }
  }

  return (
    <form id="tx-form" action={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        {(['expense', 'income'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
              type === t
                ? t === 'expense'
                  ? 'bg-danger text-white border-danger'
                  : 'bg-accent text-white border-accent'
                : 'border-line text-ink/60'
            }`}
          >
            {t === 'expense' ? 'Uscita' : 'Entrata'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1.5">
            Importo (€)
          </label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            className="w-full border border-line px-3 py-2 rounded-md text-sm num"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1.5">
            Data
          </label>
          <input
            name="transaction_date"
            type="date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="w-full border border-line px-3 py-2 rounded-md text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1.5">
          Categoria
        </label>
        <select name="category_id" className="w-full border border-line px-3 py-2 rounded-md text-sm">
          <option value="">Nessuna categoria</option>
          {filtered.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1.5">
          Descrizione
        </label>
        <input
          name="description"
          type="text"
          maxLength={280}
          className="w-full border border-line px-3 py-2 rounded-md text-sm"
          placeholder="Opzionale"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-ink text-paper py-2.5 rounded-md text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
      >
        {pending ? 'Salvataggio…' : 'Aggiungi movimento'}
      </button>
    </form>
  )
}
