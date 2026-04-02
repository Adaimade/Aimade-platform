-- Add soul_preset to agents: defines which SOUL template to use at deploy time
ALTER TABLE agents ADD COLUMN soul_preset TEXT NOT NULL DEFAULT 'general';
