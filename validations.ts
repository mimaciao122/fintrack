import { z } from 'zod'

export const transactionSchema = z.object({
  category_id: z.string().uuid().nullable(),
  amount: z.number().positive('L\'importo deve essere maggiore di zero'),
  type: z.enum(['income', 'expense']),
  description: z.string().max(280).optional().nullable(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data non valida'),
})

export const budgetSchema = z.object({
  category_id: z.string().uuid(),
  amount_limit: z.number().positive('Il limite deve essere maggiore di zero'),
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}).refine((data) => data.period_end >= data.period_start, {
  message: 'La data di fine deve essere successiva alla data di inizio',
  path: ['period_end'],
})

export type TransactionInput = z.infer<typeof transactionSchema>
export type BudgetInput = z.infer<typeof budgetSchema>
