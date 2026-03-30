-- Add bot_engine column to agents table
ALTER TABLE agents ADD COLUMN bot_engine TEXT NOT NULL DEFAULT 'standard';

-- Add extra_config_enc to deployments (for HydraBot telegram_user_ids, etc.)
ALTER TABLE deployments ADD COLUMN extra_config_enc TEXT;
