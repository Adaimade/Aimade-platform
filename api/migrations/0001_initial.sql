-- Adaimade D1 initial schema

CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS agents (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  personality     TEXT NOT NULL,
  skills          TEXT NOT NULL,
  llm_provider    TEXT NOT NULL,
  llm_model       TEXT NOT NULL,
  llm_api_key_enc TEXT,
  status          TEXT NOT NULL DEFAULT 'draft',
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cloud_accounts (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL,
  display_name    TEXT NOT NULL,
  credentials_enc TEXT NOT NULL,
  is_valid        INTEGER,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS deployments (
  id                TEXT PRIMARY KEY,
  agent_id          TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  user_id           TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cloud_account_id  TEXT NOT NULL REFERENCES cloud_accounts(id),
  provider          TEXT NOT NULL,
  discord_token_enc TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'queued',
  external_id       TEXT,
  external_url      TEXT,
  error_message     TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS deployment_logs (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  deployment_id TEXT NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
  level         TEXT NOT NULL DEFAULT 'info',
  message       TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_agents_user        ON agents(user_id);
CREATE INDEX idx_cloud_accounts_user ON cloud_accounts(user_id);
CREATE INDEX idx_deployments_user   ON deployments(user_id);
CREATE INDEX idx_deployment_logs    ON deployment_logs(deployment_id, created_at);
