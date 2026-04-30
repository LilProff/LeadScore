# CLAUDE.md — Lead Scoring Dashboard

> This file is the kickstart prompt and source of truth for Claude (or any AI coding agent) working on this repo. Read it first. Update it as decisions evolve.

---

## 1. Mission

Build a **Lead Scoring Dashboard** that captures prospect information through a form, uses an AI model to qualify the lead on an **A–F grade scale**, and presents a report explaining the score. The product is opinionated: leads are scored primarily on **marketing fit and marketing budget**.

- **A** — Highly qualified (strong budget + explicit marketing needs + good fit)
- **B** — Qualified (clear marketing intent OR strong budget)
- **C** — Moderate fit, some signals
- **D** — Weak signals, low budget
- **F** — Disqualified (no marketing relevance)

---

## 2. Tech Stack (locked)

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React 18 + Vite | TailwindCSS for styling, React Router for routing, TanStack Query for data fetching |
| Backend | FastAPI (Python 3.11+) | Pydantic v2 for validation, async endpoints |
| Database | Supabase (Postgres) | RLS enabled from day one |
| AI | OpenRouter | Primary: `google/gemini-2.5-flash`; Fallback: `anthropic/claude-haiku-4.5`; structured JSON output |
| Hosting (FE) | Vercel | Auto-deploy from `main` |
| Hosting (BE) | Render / Fly.io / Railway | Pick one and stick with it |
| Source control | GitHub | Monorepo, two folders: `frontend/` and `backend/` |

---

## 3. Architecture

```
┌─────────────────────┐                     ┌──────────────────────┐
│  React + Vite       │  POST /leads/score  │  FastAPI             │
│  (Vercel)           │ ──────────────────▶ │  (Render/Fly)        │
│                     │                     │                      │
│  - LeadForm         │ ◀────────────────── │  - validate          │
│  - LoadingScreen    │   { id, status }    │  - persist (pending) │
│  - ReportPage       │                     │  - call OpenRouter   │
└─────────────────────┘                     │  - persist (scored)  │
        │                                   └──────────┬───────────┘
        │ GET /leads/{id}                              │
        │ (poll until status = scored)                 │
        │                                              │
        │            ┌───────────────────────────┐     │
        └───────────▶│  Supabase Postgres        │◀────┘
                     │  - leads table            │
                     │  - RLS policies           │
                     └───────────────────────────┘
                                  ▲
                                  │
                     ┌────────────┴──────────────┐
                     │  OpenRouter API           │
                     │  Primary: gemini-2.5-flash│
                     │  Fallback: claude-haiku-4.5│
                     └───────────────────────────┘
```

### Why this shape

- **FastAPI owns AI orchestration.** The Anthropic API key never touches the browser. Prompt logic is centralized and testable.
- **Two-write pattern.** Save the raw lead first (`status='pending'`), then call Claude, then update with the score. If the AI call fails, the lead is preserved and retryable. This is what makes the loading screen safe — the frontend polls a real DB row, it doesn't wait on a hung HTTP request.
- **Frontend never computes the score.** The grade is server-side only.

---

## 4. Database Schema

Run this in the Supabase SQL editor on day one:

```sql
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
```

---

## 5. API Contract

All endpoints live under `/api`. JSON in, JSON out.

### `POST /api/leads/score`
Create + score a lead. Returns immediately with the lead id; scoring happens in the background.

**Request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@acme.com",
  "company_name": "Acme Inc",
  "company_size": "$1M-$10M ARR",
  "employee_size": "11-50",
  "marketing_budget": "$5k-$10k/mo",
  "industry": "SaaS",
  "company_needs": "We need help with paid acquisition and SEO."
}
```

**Response (202 Accepted):**
```json
{ "id": "uuid-here", "status": "pending" }
```

### `GET /api/leads/{id}`
Fetch a single lead. Frontend polls this every ~1.5s while `status === 'pending'`.

**Response:**
```json
{
  "id": "uuid",
  "status": "scored",
  "grade": "A",
  "reasoning": "Strong marketing budget combined with...",
  "marketing_relevance_score": 92,
  "signals": ["explicit_marketing_need", "high_budget", "industry_fit"],
  "created_at": "...",
  "scored_at": "..."
}
```

### `GET /api/leads?limit=50&offset=0`
List leads, newest first. For the (future) admin view.

### `GET /api/health`
Returns `{ "ok": true }`. Used by Render/Fly health checks.

---

## 6. Scoring Prompt (the heart of the product)

This lives in `backend/app/prompts/scoring.py`. It is sent to Claude as a system prompt; the lead JSON is the user message. The model **must** return JSON only.

```
You are a B2B lead qualification analyst. You score inbound leads on an A–F
scale based on their marketing fit and budget. The product being sold is a
marketing service, so leads are valuable in proportion to (a) the strength
of their marketing need and (b) their ability to pay.

Grade rubric:
- A: Explicit marketing need + strong budget + good industry fit.
- B: Clear marketing intent OR strong budget; one strong signal.
- C: Moderate fit; ambiguous needs or modest budget.
- D: Weak signals; low budget; unclear fit.
- F: No marketing relevance. Disqualified.

The `company_needs` field is the most important signal. If it explicitly
mentions marketing, ads, SEO, growth, acquisition, branding, content, or
similar — weight that heavily upward. If it mentions something unrelated
(e.g. "we need an accounting tool"), grade D or F regardless of budget.

`marketing_budget` is the second most important signal. Higher is better,
but only matters if there is a real marketing need.

Return ONLY a JSON object with this exact shape, no prose, no markdown:

{
  "grade": "A" | "B" | "C" | "D" | "F",
  "reasoning": "2-4 sentences explaining the grade in plain English.",
  "marketing_relevance_score": 0-100,
  "signals": ["short_snake_case_tags", ...]
}
```

**Implementation notes for the scoring service:**
- Use `response_format` / strict JSON or parse defensively (try/except → mark lead `status='error'` with `error_message`).
- Keep `temperature` low (0.2) for consistency.
- Log the full prompt + response for the first ~100 leads so we can iterate on the rubric.

---

## 7. Repository Layout

```
lead-scoring-dashboard/
├── CLAUDE.md                 ← you are here
├── README.md                 ← human-facing setup
├── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LeadForm.jsx
│   │   │   ├── LoadingScreen.jsx
│   │   │   └── ScoreReport.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx           # form
│   │   │   └── ReportPage.jsx         # /report/:id
│   │   ├── lib/
│   │   │   ├── api.js                 # axios client
│   │   │   └── usePollLead.js         # polling hook
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── backend/
    ├── app/
    │   ├── main.py                    # FastAPI app, CORS, router registration
    │   ├── config.py                  # env loading via pydantic-settings
    │   ├── routes/
    │   │   └── leads.py
    │   ├── services/
    │   │   ├── supabase_client.py
    │   │   └── scoring.py             # calls Claude, parses JSON, updates row
    │   ├── models/
    │   │   └── lead.py                # Pydantic schemas
    │   └── prompts/
    │       └── scoring.py             # the prompt in section 6
    ├── tests/
    │   └── test_scoring.py            # at minimum, mock the AI and assert grade parsing
    ├── requirements.txt
    └── Dockerfile
```

---

## 8. Environment Variables

```bash
# backend/.env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # server-only, never in frontend
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-5
CORS_ORIGINS=http://localhost:5173,https://your-app.vercel.app

# frontend/.env
VITE_API_URL=http://localhost:8000      # in prod: https://your-api.onrender.com
```

---

## 9. Build Order (recommended phases)

**Phase 1 — Foundation**
- Init the monorepo, push to GitHub
- Create the Supabase project, run the schema in §4
- Deploy a "hello world" FastAPI to Render and a "hello world" Vite app to Vercel
- Wire `VITE_API_URL` and confirm CORS works end-to-end

**Phase 2 — Form + persistence (no AI yet)**
- Build `LeadForm.jsx` with all fields from §1, client-side validation
- Implement `POST /api/leads/score` that just inserts a row with `status='pending'` and returns the id
- Implement `GET /api/leads/{id}`
- Confirm the row appears in Supabase

**Phase 3 — AI scoring**
- Add the prompt in §6
- Implement `services/scoring.py`: calls Claude, parses JSON, updates the row to `status='scored'` (or `'error'`)
- Trigger it as a FastAPI `BackgroundTask` from `POST /leads/score`
- Write at least one test that mocks the Anthropic client and asserts a `pending` row becomes `scored`

**Phase 4 — Report UX**
- `LoadingScreen` component shown right after submit
- `usePollLead(id)` hook: polls `GET /leads/{id}` every 1.5s, max ~30s, then surfaces an error
- `ScoreReport` component: big A–F letter, the reasoning paragraph, the signals as chips, the relevance score as a bar
- Route: `/report/:id`

**Phase 5 — Polish**
- Loading skeletons, error states, empty states
- Basic analytics (count of submissions per grade)
- Production deploy + smoke test

---

## 10. Conventions & Guardrails

- **Frontend never sees the Anthropic key.** Ever. If you find yourself reaching for it client-side, stop and route through FastAPI.
- **Validate with Pydantic on the backend, even though the frontend also validates.** Belt and suspenders.
- **The grade is computed once, server-side, and stored.** The frontend reads it; it does not derive or override it.
- **Don't block the HTTP request on the AI call.** Return `202 Accepted` with the id, do the work in a background task, let the client poll. This is what allows the loading screen to feel responsive and survive a 10s AI latency.
- **Log AI prompts and responses for the first ~100 leads** (then turn off or sample). The rubric *will* need tuning.
- **Keep the prompt in version control.** Don't edit it through a UI. Treat it like code.
- **No premature auth.** MVP is single-tenant. Add Supabase Auth + per-user RLS once there's a real second user.

---

## 11. Open Questions (resolve before Phase 3)

- Which backend host: Render, Fly, or Railway? (Pick one.)
- Do we want a CSV export of leads in MVP, or wait?
- Should the form be public (anyone on the internet can submit) or gated behind a simple shared password? Public is the default assumption here.
- Email notification when a new A-grade lead comes in — MVP or later?

---

*Last updated: project kickoff. Update this file when architecture decisions change.*
