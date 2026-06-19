'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const authSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(8, 'La password deve avere almeno 8 caratteri'),
})

export async function signUp(formData: FormData) {
  const parsed = authSchema.parse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  const supabase = createClient()
  const { error } = await supabase.auth.signUp(parsed)

  if (error) return { error: error.message }
  return { success: true }
}

export async function signIn(formData: FormData) {
  const parsed = authSchema.parse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed)

  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
