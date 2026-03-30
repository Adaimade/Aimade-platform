# Adaimade — AI Agent Deployment Platform

> Deploy your AI Discord bot in 30 seconds. No code required.
> Fully built on the Cloudflare ecosystem.

---

## How it works

1. **Create** an AI agent (name, personality, skills, LLM)
2. **Connect** your cloud account (Zeabur or AWS)
3. **Deploy** — one click, bot comes online in Discord

---

## Architecture

```
web/           React + Vite → Cloudflare Pages
api/           Hono.js      → Cloudflare Workers  (REST API)
queue-worker/  TypeScript   → Cloudflare Workers  (deployment jobs)
               ├── Cloudflare D1      (SQLite database)
               ├── Cloudflare Queues  (async job queue)
               └── Cloudflare R2      (agent configs / artifacts)

discord-engine/   Python discord.py   → deployed to customer's cloud
agent-templates/  Dockerfile + config templates
```

**Auth:** Clerk
**Encryption:** AES-256-GCM (Web Crypto API, no dependencies)
**Bot deployment targets:** Zeabur · AWS

---

## Quick Start

### Prerequisites
- [Node.js 20+](https://nodejs.org)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/): `npm i -g wrangler`
- [Clerk account](https://clerk.com) (free)
- Cloudflare account (free)

### 1. Install dependencies
```bash
make install
```

### 2. Login to Cloudflare
```bash
npx wrangler login
```

### 3. Create Cloudflare resources (run once)
```bash
make db-create      # creates D1 database
make db-migrate     # runs SQL migrations
make r2-create      # creates R2 bucket
make queue-create   # creates deploy queue
```

### 4. Set secrets
```bash
cd api
npx wrangler secret put CLERK_SECRET_KEY
npx wrangler secret put ENCRYPTION_KEY    # use: make gen-key
```

### 5. Configure frontend
```bash
cp web/.env.example web/.env
# fill in VITE_CLERK_PUBLISHABLE_KEY from clerk.com dashboard
```

### 6. Start local dev
```bash
make dev-api   # API on http://localhost:8787
make dev-web   # Frontend on http://localhost:5173
```

---

## Deploy to production
```bash
make deploy-api
make deploy-web
make deploy-worker
```

---

## Project Structure

```
web/
├── src/
│   ├── pages/        # Home, Dashboard, Agents, AgentNew, AgentDeploy, CloudAccounts
│   ├── components/   # Layout (Sidebar, TopBar), reusable UI
│   ├── lib/          # api.ts (fetch), utils.ts
│   └── types/        # agent.ts, deployment.ts, cloud.ts

api/
├── src/
│   ├── routes/       # agents.ts, deployments.ts, cloud-accounts.ts
│   ├── middleware/   # auth.ts (Clerk JWT)
│   ├── db/           # schema.ts (Drizzle), index.ts
│   └── lib/          # crypto.ts (AES-256)
└── migrations/       # D1 SQL migrations

queue-worker/
└── src/
    ├── adapters/     # zeabur.ts, aws.ts
    └── index.ts      # queue consumer logic

discord-engine/       # Python discord.py bot (deployed to customer's cloud)
agent-templates/      # Dockerfile + config templates for deployed bots
docs/                 # Architecture, API ref, guides
```

---

## Docs
- [Architecture](./docs/architecture.md)
- [API Reference](./docs/api-reference.md)
- [Local Dev Setup](./docs/developer/local-dev-setup.md)
- [Adding a Cloud Provider](./docs/developer/adding-a-cloud.md)
- [Adding a Bot Skill](./docs/developer/adding-a-skill.md)
