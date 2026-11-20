-- Run this in Supabase SQL Editor to create required tables for real tracking

create table if not exists public.donations (
  id text primary key,
  amount numeric not null,
  currency text not null check (currency in ('MWK','USD')),
  frequency text not null check (frequency in ('once','monthly')),
  branch text not null check (branch in ('Older people','Students','Refugees','Families')),
  donor_name text not null default 'Anonymous',
  email text,
  tx_ref text unique,
  payment_status text not null check (payment_status in ('pending','successful','failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists donations_created_at_idx on public.donations (created_at desc);
create index if not exists donations_tx_ref_idx on public.donations (tx_ref);
create index if not exists donations_status_idx on public.donations (payment_status);

create table if not exists public.requests (
  id text primary key,
  name text not null,
  contact text not null,
  category text not null,
  message text not null default '',
  status text not null check (status in ('new','in_review','resolved')) default 'new',
  created_at timestamptz not null default now()
);

create index if not exists requests_created_at_idx on public.requests (created_at desc);
create index if not exists requests_status_idx on public.requests (status);

-- Keep updated_at current for donations
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_donations_updated_at on public.donations;
create trigger set_donations_updated_at
before update on public.donations
for each row execute function public.set_updated_at();

-- Security hardening: enable RLS (server-side service role bypasses RLS).
-- Do not add permissive anon/auth policies unless you intentionally expose data to clients.
alter table public.donations enable row level security;
alter table public.requests enable row level security;