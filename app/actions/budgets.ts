'use server'

import { createClient } from '@/lib/supabase/server'
import { budgetSchema, type BudgetInput } from '@/lib/validations'
import { revalidatePath } from 'next/cache'
import type { BudgetOverviewRow } from '@/types'

export async function getBudgetOverview(): Promise<BudgetOverviewRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('budget_overview').select('*')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getDailyBudgetRemaining(categoryId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('daily_budget_remaining', {
    p_category_id: categoryId,
  })
  if (error) throw new Error(error.message)
  return data as number | null
}

export async function createBudget(input: BudgetInput) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autenticato')

  const parsed = budgetSchema.parse(input)

  const { data, error } = await supabase
    .from('budgets')
    .insert({ ...parsed, user_id: user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  return data
}

export async function deleteBudget(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autenticato')

  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function getCategories() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('type')
    .order('name')

  if (error) throw new Error(error.message)
  return data
}
