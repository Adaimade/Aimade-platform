/*
 * Queue Worker — Cloudflare Queue Consumer
 *
 * This worker wakes up when the API sends a job to DEPLOY_QUEUE.
 * It does the actual deployment work:
 *   1. Fetch deployment record from D1
 *   2. Decrypt credentials
 *   3. Upload agent config to R2
 *   4. Call cloud adapter (Zeabur or AWS)
 *   5. Update deployment status in D1
 */

import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import * as schema from './db/schema'
import { decrypt } from './lib/crypto'
import * as zeaburAdapter from './adapters/zeabur'
import * as awsAdapter from './adapters/aws'
import * as railwayAdapter from './adapters/railway'

type Bindings = {
  DB:              D1Database
  R2:              R2Bucket
  ENCRYPTION_KEY:  string
  // Stock API keys — injected into HydraBot at deploy time
  FUGLE_API_KEY:   string   // Fugle MarketData (Taiwan real-time)
  FUGLE_REFRESH_TOKEN: string // Fugle refresh token
  FINMIND_TOKEN:   string   // FinMind (Taiwan history)
  TWELVE_DATA_KEY: string   // Twelve Data (US stocks)
}

type DeployMessage = {
  deployment_id: string
}

export default {
  // queue() is called by Cloudflare when messages arrive
  async queue(batch: MessageBatch<DeployMessage>, env: Bindings): Promise<void> {
    const db = drizzle(env.DB, { schema })

    for (const message of batch.messages) {
      const { deployment_id } = message.body

      try {
        await processDeployment(deployment_id, db, env)
        message.ack()  // mark as processed
      } catch (err) {
        console.error(`Deployment ${deployment_id} failed:`, err)
        message.retry() // will retry up to max_retries times
      }
    }
  },
}

async function processDeployment(
  deploymentId: string,
  db: ReturnType<typeof drizzle>,
  env: Bindings,
) {
  // 1. Fetch deployment record
  const deployment = await db.select()
    .from(schema.deployments)
    .where(eq(schema.deployments.id, deploymentId))
    .get()

  if (!deployment) throw new Error(`Deployment ${deploymentId} not found`)

  // 2. Fetch related records
  const agent = await db.select().from(schema.agents)
    .where(eq(schema.agents.id, deployment.agent_id)).get()
  const account = await db.select().from(schema.cloudAccounts)
    .where(eq(schema.cloudAccounts.id, deployment.cloud_account_id)).get()

  if (!agent || !account) throw new Error('Agent or cloud account not found')

  // 3. Update status → building
  await updateStatus(db, deploymentId, 'building')
  await writeLog(db, deploymentId, 'info', `Starting deployment for agent "${agent.name}"`)

  // 4. Decrypt all credentials
  const botToken  = await decrypt(deployment.discord_token_enc, env.ENCRYPTION_KEY)
  const llmApiKey = await decrypt(agent.llm_api_key_enc!, env.ENCRYPTION_KEY)
  const rawCreds  = JSON.parse(account.credentials_enc) as Record<string, string>
  const creds: Record<string, string> = {}
  for (const [k, v] of Object.entries(rawCreds)) {
    creds[k] = await decrypt(v, env.ENCRYPTION_KEY)
  }

  // 5. Build image URI + env vars based on bot engine
  await updateStatus(db, deploymentId, 'deploying')

  const botEngine = (agent as any).bot_engine ?? 'standard'
  const botLabel = botEngine === 'hydrabot' ? 'HydraBot (Telegram)'
                 : botEngine === 'openclaw'  ? 'OpenClaw (Discord)'
                 : 'Standard Discord Bot'
  await writeLog(db, deploymentId, 'info', `Bot engine: ${botLabel}`)

  let imageUri: string
  let envVars: Record<string, string>

  if (botEngine === 'hydrabot') {
    // HydraBot — Telegram bot
    imageUri = 'ghcr.io/adaimade/hydrabot:v12'

    // Decrypt extra config for Telegram user IDs
    let telegramUserIds = ''
    if (deployment.extra_config_enc) {
      const extraConfig = JSON.parse(await decrypt(deployment.extra_config_enc, env.ENCRYPTION_KEY))
      telegramUserIds = (extraConfig.telegram_user_ids ?? []).join(',')
    }

    envVars = {
      TELEGRAM_BOT_TOKEN:   botToken,
      TELEGRAM_USER_IDS:    telegramUserIds,
      LLM_PROVIDER:         agent.llm_provider,
      LLM_MODEL:            agent.llm_model,
      LLM_API_KEY:          llmApiKey,
      SOUL_PRESET:          (agent as any).soul_preset ?? 'general',
      // Stock data APIs
      FUGLE_API_KEY:        env.FUGLE_API_KEY        ?? '',
      FUGLE_REFRESH_TOKEN:  env.FUGLE_REFRESH_TOKEN  ?? '',
      FINMIND_TOKEN:        env.FINMIND_TOKEN         ?? '',
      TWELVE_DATA_KEY:      env.TWELVE_DATA_KEY       ?? '',
    }

  } else if (botEngine === 'openclaw') {
    // OpenClaw — multi-platform (Discord)
    imageUri = 'ghcr.io/adaimade/openclaw:latest'
    envVars = {
      DISCORD_BOT_TOKEN: botToken,
      LLM_PROVIDER:      agent.llm_provider,
      LLM_MODEL:         agent.llm_model,
      LLM_API_KEY:       llmApiKey,
      SOUL_PRESET:       (agent as any).soul_preset ?? 'general',
    }

  } else {
    // Standard discord-engine (default)
    imageUri = 'ghcr.io/adaimade/discord-bot:latest'

    const agentConfig = {
      agent_id:    agent.id,
      agent_name:  agent.name,
      personality: JSON.parse(agent.personality),
      skills:      JSON.parse(agent.skills),
      llm: { provider: agent.llm_provider, model: agent.llm_model },
    }
    const configKey = `configs/${agent.id}/agent_config.json`
    await env.R2.put(configKey, JSON.stringify(agentConfig, null, 2), {
      httpMetadata: { contentType: 'application/json' },
    })

    envVars = {
      DISCORD_BOT_TOKEN: botToken,
      LLM_API_KEY:       llmApiKey,
      AGENT_CONFIG_B64:  btoa(unescape(encodeURIComponent(JSON.stringify(agentConfig)))),
    }
  }

  await writeLog(db, deploymentId, 'info', `Deploying ${imageUri} to ${account.provider}...`)

  let externalId: string
  let externalUrl: string | null

  if (account.provider === 'zeabur') {
    const result = await zeaburAdapter.deploy(imageUri, agent.id, envVars, creds as any)
    externalId  = result.externalId
    externalUrl = result.externalUrl
  } else if (account.provider === 'aws') {
    const result = await awsAdapter.deploy(imageUri, agent.id, envVars, creds as any)
    externalId  = result.externalId
    externalUrl = result.externalUrl
  } else if (account.provider === 'railway') {
    const result = await railwayAdapter.deploy(imageUri, agent.id, envVars, creds as any)
    externalId  = result.externalId
    externalUrl = result.externalUrl
  } else {
    throw new Error(`Unknown provider: ${account.provider}`)
  }

  // 7. Mark as live
  await db.update(schema.deployments).set({
    status:      'live',
    external_id:  externalId,
    external_url: externalUrl ?? null,
  }).where(eq(schema.deployments.id, deploymentId)).run()

  await writeLog(db, deploymentId, 'info', '✅ Deployment complete! Discord bot is now online.')
}

async function updateStatus(db: ReturnType<typeof drizzle>, id: string, status: string) {
  await db.update(schema.deployments).set({ status }).where(eq(schema.deployments.id, id)).run()
}

async function writeLog(db: ReturnType<typeof drizzle>, deploymentId: string, level: string, message: string) {
  await db.insert(schema.deploymentLogs).values({ deployment_id: deploymentId, level, message }).run()
  console.log(`[${level.toUpperCase()}] ${message}`)
}
