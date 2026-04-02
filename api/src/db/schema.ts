import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

/*
 * Drizzle ORM schema — defines all tables.
 * D1 is SQLite-based, so we use sqlite-core.
 * Run: wrangler d1 migrations apply adaimade-db
 */

export const users = sqliteTable('users', {
  id:         text('id').primaryKey(),           // Clerk user ID
  email:      text('email').notNull().unique(),
  created_at: text('created_at').notNull().default(new Date().toISOString()),
})

export const agents = sqliteTable('agents', {
  id:              text('id').primaryKey(),
  user_id:         text('user_id').notNull().references(() => users.id),
  name:            text('name').notNull(),
  description:     text('description'),
  personality:     text('personality').notNull(),  // JSON string
  skills:          text('skills').notNull(),        // JSON string (array)
  llm_provider:    text('llm_provider').notNull(),
  llm_model:       text('llm_model').notNull(),
  llm_api_key_enc: text('llm_api_key_enc'),         // AES-256 encrypted
  bot_engine:      text('bot_engine').notNull().default('standard'), // 'standard' | 'hydrabot' | 'openclaw'
  soul_preset:     text('soul_preset').notNull().default('general'), // 'general' | 'stock_analyst' | 'code_expert' | 'daily_butler' | 'task_manager'
  status:          text('status').notNull().default('draft'),
  created_at:      text('created_at').notNull().default(new Date().toISOString()),
})

export const cloudAccounts = sqliteTable('cloud_accounts', {
  id:              text('id').primaryKey(),
  user_id:         text('user_id').notNull().references(() => users.id),
  provider:        text('provider').notNull(),       // 'zeabur' | 'aws'
  display_name:    text('display_name').notNull(),
  credentials_enc: text('credentials_enc').notNull(), // AES-256 encrypted JSON
  is_valid:        integer('is_valid', { mode: 'boolean' }),
  created_at:      text('created_at').notNull().default(new Date().toISOString()),
})

export const deployments = sqliteTable('deployments', {
  id:                text('id').primaryKey(),
  agent_id:          text('agent_id').notNull().references(() => agents.id),
  user_id:           text('user_id').notNull().references(() => users.id),
  cloud_account_id:  text('cloud_account_id').notNull().references(() => cloudAccounts.id),
  provider:          text('provider').notNull(),
  discord_token_enc: text('discord_token_enc').notNull(),  // also used for telegram token
  extra_config_enc:  text('extra_config_enc'),              // JSON: { telegram_user_ids: [...] }
  status:            text('status').notNull().default('queued'),
  external_id:       text('external_id'),
  external_url:      text('external_url'),
  error_message:     text('error_message'),
  created_at:        text('created_at').notNull().default(new Date().toISOString()),
})

export const deploymentLogs = sqliteTable('deployment_logs', {
  id:            integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  deployment_id: text('deployment_id').notNull().references(() => deployments.id),
  level:         text('level').notNull().default('info'),
  message:       text('message').notNull(),
  created_at:    text('created_at').notNull().default(new Date().toISOString()),
})
