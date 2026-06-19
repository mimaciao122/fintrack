'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBudget } from '@/app/actions/budgets'
import type { Category } from '@/types'

export default function BudgetForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const expenseCategories = categories.filter((c) => c.type === 'expense')

  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)
  const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    try {
      await createBudget({
        category_id: formData.get('category_id') as string,
        amount_limit: parseFloat(formData.get('amount_limit') as string),
        period_start: formData.get('period_start') as string,
        period_end: formData.get('period_end') as string,
      })
      router.refresh()
      ;(document.getElementById('budget-form') as HTMLFormElement)?.reset()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore imprevisto')
    } finally {
      setPending(false)
    }
  }

  return (
    <form id="budget-form" action={handleSubmit} className="space-y-3">
      <select
        name="category_id"
        required
        className="w-full border border-line px-3 py-2 rounded-md text-sm"
      >
        <option value="">Seleziona categoria</option>
        {expenseCategories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.icon} {c.name}
          </option>
        ))}
      </select>

      <input
        name="amount_limit"
        type="number"
        step="0.01"
        min="0.01"
        required
        placeholder="Limite di spesa (€)"
        className="w-full border border-line px-3 py-2 rounded-md text-sm num"
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          name="period_start"
          type="date"
          required
          defaultValue={firstOfMonth}
          className="w-full border border-line px-3 py-2 rounded-md text-sm"
        />
        <input
          name="period_end"
          type="date"
          required
          defaultValue={lastOfMonth}
          className="w-full border border-line px-3 py-2 rounded-md text-sm"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full border border-ink py-2 rounded-md text-sm font-medium hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
      >
        {pending ? 'Salvataggio…' : 'Imposta limite'}
      </button>
    </form>
  )
}
