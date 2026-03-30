# System Architecture

## Overview

Adaimade is an AI Agent Deployment Platform. Users create AI agents through a web UI, connect their own cloud credentials, and deploy Discord bots to their cloud infrastructure with one click.

## Core Data Flow

```
User (Browser)
  │
  ├─ POST /v1/deployments
  │
  ▼
backend/ (FastAPI)
  ├─ Validates JWT (Supabase)
  ├─ Encrypts Discord token (AES-256)
  ├─ Creates deployment record (status=queued)
  └─ Enqueues Celery task
  │
  ▼
celery-worker (async)
  ├─ Decrypts all credentials
  ├─ Calls deployment-engine /build
  │
  ▼
deployment-engine/ (FastAPI)
  ├─ builder.py: copies template + injects config
  ├─ docker_builder.py: builds image, pushes to registry
  └─ adapter.deploy(): deploys to user's cloud
  │
  ▼
User's Cloud (Cloudflare / Zeabur / AWS)
  │
  ▼
discord-engine/ (running in container)
  ├─ Reads agent_config.json
  ├─ Loads skill Cogs
  └─ bot.run(token) → Discord bot online
```

## Modules

| Module | Tech | Purpose |
|--------|------|---------|
| `frontend/` | Next.js 14 + Tailwind | User dashboard |
| `backend/` | FastAPI + PostgreSQL + Celery | API + job queue |
| `deployment-engine/` | FastAPI + Docker SDK | Build + deploy orchestrator |
| `cloud-adapters/` | Python | Cloudflare / Zeabur / AWS API wrappers |
| `discord-engine/` | discord.py | Bot runtime |
| `agent-templates/` | Docker + Python | Deployable bot template |

## Security

- All credentials encrypted at rest with AES-256-GCM
- Supabase JWT validates every API request
- Cloud secrets injected at deploy time, never stored in plaintext after encryption
- Bot containers run as non-root user
