export type TransactionType = 'income' | 'expense'

export interface Category {
  id: string
  user_id: string | null
  name: string
  type: TransactionType
  icon: string
  color: string
}

export interface Transaction {
  id: string
  user_id: string
  category_id: string | null
  amount: number
  type: TransactionType
  description: string | null
  transaction_date: string
  created_at: string
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount_limit: number
  period_start: string
  period_end: string
}

export interface BudgetOverviewRow {
  budget_id: string
  category_id: string
  category_name: string
  icon: string
  color: string
  amount_limit: number
  period_start: string
  period_end: string
  spent: number
  remaining_total: number
  days_left: number
}
