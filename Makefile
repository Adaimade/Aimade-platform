.PHONY: dev dev-api dev-web install gen-key db-create db-migrate deploy-api deploy-web

# ── Local development ──────────────────────────────────────

# Start API worker locally (port 8787)
dev-api:
	cd api && npx wrangler dev

# Start frontend dev server (port 5173)
dev-web:
	cd web && npm run dev

# Install all dependencies
install:
	cd web          && npm install
	cd api          && npm install
	cd queue-worker && npm install

# ── Cloudflare setup ───────────────────────────────────────

# Generate a new 32-byte encryption key
gen-key:
	node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Create D1 database (run once)
db-create:
	cd api && npx wrangler d1 create adaimade-db

# Run migrations
db-migrate:
	cd api && npx wrangler d1 migrations apply adaimade-db

# Create R2 bucket (run once)
r2-create:
	npx wrangler r2 bucket create adaimade-builds

# Create Queue (run once)
queue-create:
	npx wrangler queues create adaimade-deploy-queue

# ── Secrets (run each once after wrangler login) ────────────

secrets:
	@echo "Run these commands:"
	@echo "  cd api && npx wrangler secret put CLERK_SECRET_KEY"
	@echo "  cd api && npx wrangler secret put ENCRYPTION_KEY"
	@echo "  cd queue-worker && npx wrangler secret put ENCRYPTION_KEY"

# ── Deploy ─────────────────────────────────────────────────

deploy-api:
	cd api && npx wrangler deploy

deploy-web:
	cd web && npm run deploy

deploy-worker:
	cd queue-worker && npx wrangler deploy
