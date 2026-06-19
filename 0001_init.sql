-- ============================================================
-- Personal Finance Manager — Migrazione iniziale
-- ============================================================
create extension if not exists "uuid-ossp";

-- ---------- PROFILES ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  currency text default 'EUR',
  created_at timestamptz default now()
);

-- Crea automaticamente un profilo quando un utente si registra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- CATEGORIES ----------
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade, -- null = categoria di sistema
  name text not null,
  type text check (type in ('income', 'expense')) not null,
  icon text default '💰',
  color text default '#6366f1',
  created_at timestamptz default now()
);

-- ---------- TRANSACTIONS ----------
create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  type text check (type in ('income', 'expense')) not null,
  description text,
  transaction_date date not null default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_transactions_user_date on public.transactions(user_id, transaction_date desc);
create index idx_transactions_user_category on public.transactions(user_id, category_id);

-- ---------- BUDGETS ----------
create table public.budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  amount_limit numeric(12,2) not null check (amount_limit > 0),
  period_start date not null,
  period_end date not null check (period_end >= period_start),
  created_at timestamptz default now()
);

create index idx_budgets_user_period on public.budgets(user_id, period_start, period_end);

-- ---------- AUDIT LOG ----------
create table public.audit_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  table_name text not null,
  operation text not null,
  old_data jsonb,
  new_data jsonb,
  changed_at timestamptz default now()
);

create or replace function public.audit_trigger_fn()
returns trigger as $$
begin
  insert into public.audit_log (user_id, table_name, operation, old_data, new_data)
  values (
    coalesce(new.user_id, old.user_id),
    tg_table_name,
    tg_op,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('UPDATE','INSERT') then to_jsonb(new) else null end
  );
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger transactions_audit
  after insert or update or delete on public.transactions
  for each row execute procedure public.audit_trigger_fn();

-- updated_at automatico
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.audit_log enable row level security;

-- PROFILES
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- CATEGORIES (proprie + di sistema)
create policy "categories_select" on public.categories
  for select using (user_id = auth.uid() or user_id is null);
create policy "categories_insert_own" on public.categories
  for insert with check (user_id = auth.uid());
create policy "categories_update_own" on public.categories
  for update using (user_id = auth.uid());
create policy "categories_delete_own" on public.categories
  for delete using (user_id = auth.uid());

-- TRANSACTIONS
create policy "transactions_select_own" on public.transactions
  for select using (user_id = auth.uid());
create policy "transactions_insert_own" on public.transactions
  for insert with check (user_id = auth.uid());
create policy "transactions_update_own" on public.transactions
  for update using (user_id = auth.uid());
create policy "transactions_delete_own" on public.transactions
  for delete using (user_id = auth.uid());

-- BUDGETS
create policy "budgets_all_own" on public.budgets
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- AUDIT LOG (solo lettura delle proprie righe, nessuna scrittura manuale)
create policy "audit_select_own" on public.audit_log
  for select using (user_id = auth.uid());

-- ============================================================
-- FUNZIONE: Budget Residuo Giornaliero (sicura, usa auth.uid())
-- ============================================================
create or replace function public.daily_budget_remaining(p_category_id uuid)
returns numeric as $$
declare
  v_budget record;
  v_spent numeric;
  v_days_left int;
begin
  select * into v_budget
  from public.budgets
  where user_id = auth.uid()
    and category_id = p_category_id
    and current_date between period_start and period_end
  order by period_start desc
  limit 1;

  if v_budget is null then
    return null;
  end if;

  select coalesce(sum(amount), 0) into v_spent
  from public.transactions
  where user_id = auth.uid()
    and category_id = p_category_id
    and type = 'expense'
    and transaction_date between v_budget.period_start and current_date;

  v_days_left := greatest(v_budget.period_end - current_date + 1, 1);

  return round((v_budget.amount_limit - v_spent) / v_days_left, 2);
end;
$$ language plpgsql security definer;

-- ============================================================
-- VIEW: riepilogo budget per dashboard (tutte le categorie attive)
-- ============================================================
create or replace view public.budget_overview as
select
  b.id as budget_id,
  b.category_id,
  c.name as category_name,
  c.icon,
  c.color,
  b.amount_limit,
  b.period_start,
  b.period_end,
  coalesce(sum(t.amount) filter (
    where t.type = 'expense'
      and t.transaction_date between b.period_start and current_date
  ), 0) as spent,
  b.amount_limit - coalesce(sum(t.amount) filter (
    where t.type = 'expense'
      and t.transaction_date between b.period_start and current_date
  ), 0) as remaining_total,
  greatest(b.period_end - current_date + 1, 1) as days_left
from public.budgets b
join public.categories c on c.id = b.category_id
left join public.transactions t
  on t.category_id = b.category_id and t.user_id = b.user_id
where b.user_id = auth.uid()
  and current_date between b.period_start and b.period_end
group by b.id, b.category_id, c.name, c.icon, c.color, b.amount_limit, b.period_start, b.period_end;

-- ============================================================
-- SEED: categorie di sistema condivise (user_id = null)
-- ============================================================
insert into public.categories (user_id, name, type, icon, color) values
  (null, 'Stipendio', 'income', '💼', '#22c55e'),
  (null, 'Freelance', 'income', '💻', '#10b981'),
  (null, 'Spesa alimentare', 'expense', '🛒', '#f97316'),
  (null, 'Trasporti', 'expense', '🚗', '#3b82f6'),
  (null, 'Casa', 'expense', '🏠', '#8b5cf6'),
  (null, 'Svago', 'expense', '🎬', '#ec4899'),
  (null, 'Salute', 'expense', '⚕️', '#ef4444'),
  (null, 'Altro', 'expense', '📦', '#64748b');
