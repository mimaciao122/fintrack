import type { BudgetOverviewRow } from '@/types'
import { deleteBudget } from '@/app/actions/budgets'

function formatEUR(n: number) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n)
}

export default function BudgetCard({ budget }: { budget: BudgetOverviewRow }) {
  const pctUsed = Math.min((budget.spent / budget.amount_limit) * 100, 100)
  const dailyRemaining = budget.remaining_total / budget.days_left
  const isOverBudget = budget.remaining_total < 0
  const isWarning = !isOverBudget && pctUsed > 75

  return (
    <div className="border border-line bg-white rounded-lg p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{budget.icon}</span>
          <span className="font-medium text-sm">{budget.category_name}</span>
        </div>
        <form action={async () => { await deleteBudget(budget.budget_id) }}>
          <button
            type="submit"
            className="text-xs text-ink/40 hover:text-danger transition-colors"
            aria-label="Elimina budget"
          >
            ✕
          </button>
        </form>
      </div>

      {/* Barra di progresso */}
      <div className="h-1.5 bg-line rounded-full overflow-hidden mb-3">
        <div
          className={`h-full transition-all ${
            isOverBudget ? 'bg-danger' : isWarning ? 'bg-amber-500' : 'bg-accent'
          }`}
          style={{ width: `${pctUsed}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-ink/50 mb-4 num">
        <span>{formatEUR(budget.spent)} spesi</span>
        <span>{formatEUR(budget.amount_limit)} limite</span>
      </div>

      {/* Elemento distintivo: budget residuo giornaliero */}
      <div className="border-t border-line pt-3">
        <p className="text-xs uppercase tracking-wide text-ink/40 mb-1">
          Disponibile oggi
        </p>
        <p
          className={`font-display text-2xl num ${
            isOverBudget ? 'text-danger' : 'text-ink'
          }`}
        >
          {isOverBudget ? '−' : ''}{formatEUR(Math.abs(dailyRemaining))}
        </p>
        <p className="text-xs text-ink/40 mt-0.5">
          {isOverBudget
            ? 'budget superato per questo periodo'
            : `su ${budget.days_left} giorni rimanenti`}
        </p>
      </div>
    </div>
  )
}
