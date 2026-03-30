# Local Development Setup

## Prerequisites

- Docker + Docker Compose
- Node.js 20+
- Python 3.12+
- A Supabase project (free tier works)

## 1. Clone & Configure

```bash
git clone https://github.com/Adaimade/Adaimade.git
cd Adaimade
```

Copy env files:
```bash
cp backend/.env.example backend/.env
cp deployment-engine/.env.example deployment-engine/.env
cp frontend/.env.local.example frontend/.env.local
```

## 2. Generate Encryption Key

```bash
python3 -c "import os; print(os.urandom(32).hex())"
```

Paste the result into `backend/.env` as `CREDENTIAL_ENCRYPTION_KEY`.

## 3. Configure Supabase

1. Create project at supabase.com
2. Copy `Project URL` and `anon key` → `frontend/.env.local`
3. Copy `JWT Secret` (Settings → API) → `backend/.env` as `SUPABASE_JWT_SECRET`

## 4. Start Backend Services

```bash
make dev
# or
docker compose up --build
```

Services started:
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Backend API: `localhost:8000`
- Deployment Engine: `localhost:8001`
- Celery Worker: (background)

## 5. Start Frontend

```bash
make frontend-install
make frontend-dev
# or
cd frontend && npm install && npm run dev
```

Frontend: `http://localhost:3000`

## 6. Verify

```bash
curl http://localhost:8000/health
# {"status": "ok"}

curl http://localhost:8001/health
# {"status": "ok"}
```

## Development Tips

- Backend auto-reloads on file change (uvicorn --reload)
- Frontend hot-reloads (Next.js dev server)
- Check Celery task logs: `docker compose logs celery-worker -f`
- Run migrations: `make migrate`
