# Saldo — Personal Finance Manager

App completa per la gestione finanziaria personale multi-utente: entrate, uscite, budget per categoria con calcolo del residuo giornaliero.

## Stack
- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** (palette custom, font Fraunces/Inter/JetBrains Mono)
- **Supabase** (PostgreSQL + Auth + Row Level Security)
- **Zod** per validazione condivisa client/server

## Setup

### 1. Crea il progetto Supabase
Vai su [supabase.com](https://supabase.com), crea un nuovo progetto, poi:

```bash
# Installa Supabase CLI se non l'hai già
npm install -g supabase

# Collega il progetto locale
supabase link --project-ref <il-tuo-project-ref>

# Applica la migrazione (schema + RLS + funzioni + seed)
supabase db push
```

In alternativa, copia il contenuto di `supabase/migrations/0001_init.sql` e incollalo nel **SQL Editor** della dashboard Supabase, poi esegui.

### 2. Variabili d'ambiente
Copia `.env.local.example` in `.env.local` e compila con i valori da
**Project Settings → API** sulla dashboard Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # solo se servono operazioni server-side privilegiate
```

### 3. Installa e avvia
```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) — verrai reindirizzato a `/login`.

### 4. Deploy
```bash
npm i -g vercel
vercel
```
Imposta le stesse variabili d'ambiente nel pannello Vercel (Project Settings → Environment Variables).

## Cosa fa la migrazione SQL
- Crea le tabelle `profiles`, `categories`, `transactions`, `budgets`, `audit_log`
- Attiva **Row Level Security** su tutte le tabelle: ogni utente vede e modifica solo le proprie righe (`auth.uid()`)
- Crea un profilo automaticamente alla registrazione (trigger su `auth.users`)
- Definisce la funzione `daily_budget_remaining(category_id)` per il calcolo dinamico del budget residuo
- Crea la view `budget_overview` usata dalla dashboard
- Inserisce 8 categorie di sistema condivise (stipendio, spesa, trasporti, ecc.)
- Aggiunge un trigger di audit su `transactions` (tracciabilità per dispute)

## Sicurezza implementata
- RLS attiva su ogni tabella, nessuna query bypassa il filtro per utente
- `user_id` non è mai accettato dal client: viene sempre impostato server-side leggendo la sessione (`app/actions/*.ts`)
- Validazione Zod sia lato client (UX) che server (sicurezza reale)
- Middleware Next.js protegge `/dashboard/*` redirigendo utenti non autenticati
- Service role key non è mai esposta al bundle client (solo `NEXT_PUBLIC_*` arrivano al browser)

## Struttura cartelle
```
app/
  actions/        Server Actions (auth, transactions, budgets) — qui vive la logica di business
  dashboard/       Pagina principale (Server Component)
  login/           Pagina di autenticazione (Client Component)
components/        TransactionForm, TransactionList, BudgetCard, BudgetForm
lib/
  supabase/        Client browser/server Supabase
  validations.ts   Schemi Zod condivisi
supabase/
  migrations/      SQL: schema, RLS, funzioni, seed
types/             Tipi TypeScript di dominio
middleware.ts       Protezione route + refresh sessione
```

## Prossimi sviluppi consigliati
- Grafici di andamento mensile (Recharts) per categoria
- Notifiche quando il budget residuo giornaliero scende sotto una soglia
- Esportazione CSV/PDF dei movimenti
- Categorie ricorrenti (es. abbonamenti) con generazione automatica transazioni
- Test E2E sulle policy RLS con due utenti distinti (isolamento dati)
