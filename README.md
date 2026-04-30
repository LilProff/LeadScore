# Lead Scoring Dashboard

A B2B lead qualification tool. Submit a prospect via a form; an AI model grades the lead A–F based on marketing fit and budget; a report explains the score.

## Prerequisites

- Python 3.11+
- Node.js 18+
- A Supabase project (free tier is fine)
- An Anthropic API key

## First-time setup

### 1. Clone and configure env vars

```bash
git clone <repo-url>
cd lead-scoring-dashboard

# Backend env
cp .env.example backend/.env
# Edit backend/.env — fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, CORS_ORIGINS

# Frontend env
cp .env.example frontend/.env
# Edit frontend/.env — set VITE_API_URL (default: http://localhost:8000)
```

### 2. Run the Supabase schema

Open `backend/supabase/schema.sql` and paste the contents into the Supabase SQL editor, then click **Run**.

### 3. Start the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# → http://localhost:8000
# → http://localhost:8000/api/health  (should return {"ok": true})
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

Open `http://localhost:5173` — you should see **"Lead Scoring Dashboard"** and **"Backend says: ok"**.

## Project structure

```
lead-scoring-dashboard/
├── CLAUDE.md           ← AI agent source of truth
├── README.md
├── .env.example        ← template for all env vars
├── .gitignore
├── frontend/           ← React 18 + Vite + TailwindCSS
└── backend/            ← FastAPI + Supabase + Anthropic Claude
```

See `CLAUDE.md` for full architecture, schema, API contract, and build phases.
