// Cloudflare Workers bindings — matches wrangler.toml
export type Bindings = {
  DB:           D1Database        // Cloudflare D1 (SQLite)
  DEPLOY_QUEUE: Queue             // Cloudflare Queue (outbound)
  KV:           KVNamespace       // Cloudflare KV
  CLERK_SECRET_KEY:      string   // Secret
  CLERK_PUBLISHABLE_KEY: string   // Var (public)
  ENCRYPTION_KEY:        string   // Secret (32-byte hex for AES-256)
  ADMIN_EMAILS:          string   // Comma-separated admin email whitelist
  ENVIRONMENT:      string
}
