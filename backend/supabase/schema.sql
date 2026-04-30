create extension if not exists "pgcrypto";

create type lead_status as enum ('pending', 'scored', 'error');
create type lead_grade  as enum ('A', 'B', 'C', 'D', 'F');

create table public.leads (
  id                          uuid primary key default gen_random_uuid(),
  -- Form inputs
  name                        text not null,
  email                       text not null,
  company_name                text not null,
  company_size                text,        -- e.g. "$1M-$10M ARR"
  employee_size               text,        -- e.g. "11-50"
  marketing_budget            text,        -- e.g. "$5k-$10k/mo"
  industry                    text,
  company_needs               text,        -- free text
  -- AI output
  grade                       lead_grade,
  reasoning                   text,
  marketing_relevance_score   int check (marketing_relevance_score between 0 and 100),
  signals                     jsonb,       -- e.g. ["explicit_marketing_need","high_budget"]
  -- Lifecycle
  status                      lead_status not null default 'pending',
  error_message               text,
  created_at                  timestamptz not null default now(),
  scored_at                   timestamptz
);

create index idx_leads_email      on public.leads (email);
create index idx_leads_status     on public.leads (status);
create index idx_leads_created_at on public.leads (created_at desc);

alter table public.leads enable row level security;

-- MVP policy: backend uses the service_role key (bypasses RLS).
-- If/when we add user auth, replace this with proper per-user policies.
create policy "service_role full access"
  on public.leads for all
  to service_role
  using (true) with check (true);
