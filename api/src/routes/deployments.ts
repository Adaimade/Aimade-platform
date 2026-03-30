import { Hono } from 'hono'
import { eq, and } from 'drizzle-orm'
import { db, deployments, agents, cloudAccounts } from '../db'
import { encrypt } from '../lib/crypto'
import type { Bindings } from '../types'

const router = new Hono<{ Bindings: Bindings }>()

// POST /v1/deployments — queue a deployment job
router.post('/', async (c) => {
  const userId = c.get('userId' as never) as string
  const body   = await c.req.json()

  // Verify agent belongs to user
  const agent = await db(c.env.DB).select().from(agents)
    .where(and(eq(agents.id, body.agent_id), eq(agents.user_id, userId))).get()
  if (!agent) return c.json({ error: 'Agent not found' }, 404)

  // Verify cloud account belongs to user
  const account = await db(c.env.DB).select().from(cloudAccounts)
    .where(and(eq(cloudAccounts.id, body.cloud_account_id), eq(cloudAccounts.user_id, userId))).get()
  if (!account) return c.json({ error: 'Cloud account not found' }, 404)

  // Encrypt bot token (Discord or Telegram) before storing
  const discord_token_enc = await encrypt(body.bot_token, c.env.ENCRYPTION_KEY)

  // Encrypt extra config if provided (e.g. telegram_user_ids for HydraBot)
  const extra_config_enc = body.extra_config
    ? await encrypt(JSON.stringify(body.extra_config), c.env.ENCRYPTION_KEY)
    : null

  const id = crypto.randomUUID()
  await db(c.env.DB).insert(deployments).values({
    id,
    agent_id:         body.agent_id,
    user_id:          userId,
    cloud_account_id: body.cloud_account_id,
    provider:         account.provider,
    discord_token_enc,
    extra_config_enc,
    status:           'queued',
  }).run()

  // Send job to Cloudflare Queue (picked up by queue-worker)
  await c.env.DEPLOY_QUEUE.send({ deployment_id: id })

  return c.json({ deployment_id: id, status: 'queued' }, 202)
})

// GET /v1/deployments/:id/status
router.get('/:id/status', async (c) => {
  const userId = c.get('userId' as never) as string
  const row = await db(c.env.DB).select().from(deployments)
    .where(and(eq(deployments.id, c.req.param('id')), eq(deployments.user_id, userId))).get()

  if (!row) return c.json({ error: 'Not found' }, 404)

  return c.json({
    deployment_id: row.id,
    status:        row.status,
    external_id:   row.external_id,
    external_url:  row.external_url,
    error_message: row.error_message,
  })
})

// GET /v1/deployments — list all for user
router.get('/', async (c) => {
  const userId = c.get('userId' as never) as string
  const rows = await db(c.env.DB).select().from(deployments)
    .where(eq(deployments.user_id, userId)).all()
  return c.json(rows.map(({ discord_token_enc, ...rest }) => rest))
})

export default router
