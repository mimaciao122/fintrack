'use server'

import { createClient } from '@/lib/supabase/server'
import { transactionSchema, type TransactionInput } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getTransactions(limit = 50) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('*, categories(name, icon, color)')
    .order('transaction_date', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data
}

export async function createTransaction(input: TransactionInput) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autenticato')

  // Validazione server-side: non fidarsi mai del solo controllo client
  const parsed = transactionSchema.parse(input)

  const { data, error } = await supabase
    .from('transactions')
    .insert({ ...parsed, user_id: user.id }) // user_id forzato dal server
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  return data
}

export async function updateTransaction(id: string, input: TransactionInput) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autenticato')

  const parsed = transactionSchema.parse(input)

  const { data, error } = await supabase
    .from('transactions')
    .update(parsed)
    .eq('id', id)
    .eq('user_id', user.id) // doppia difesa oltre RLS
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  return data
}

export async function deleteTransaction(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autenticato')

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
}
