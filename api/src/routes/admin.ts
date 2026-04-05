import { Hono } from 'hono'
import { getAuth } from '@hono/clerk-auth'
import { eq, desc, count, and, gte } from 'drizzle-orm'
import { db, users, agents, deployments, cloudAccounts } from '../db'
import type { Bindings } from '../types'

const router = new Hono<{ Bindings: Bindings }>()

// Admin guard — must be called on every route below
function requireAdmin(adminEmails: string, email: string | undefined) {
  if (!email) return false
  return adminEmails.split(',').map(e => e.trim().toLowerCase()).includes(email.toLowerCase())
}

// GET /admin/stats — platform-wide overview
router.get('/stats', async (c) => {
  const auth  = getAuth(c)
  const email = auth?.sessionClaims?.email as string | undefined
  if (!requireAdmin(c.env.ADMIN_EMAILS, email)) return c.json({ error: 'Forbidden' }, 403)

  const database = db(c.env.DB)

  const [
    totalUsers,
    totalAgents,
    totalDeployments,
    liveDeployments,
    failedDeployments,
    totalCloudAccounts,
  ] = await Promise.all([
    database.select({ n: count() }).from(users).get(),
    database.select({ n: count() }).from(agents).get(),
    database.select({ n: count() }).from(deployments).get(),
    database.select({ n: count() }).from(deployments).where(eq(deployments.status, 'live')).get(),
    database.select({ n: count() }).from(deployments).where(eq(deployments.status, 'failed')).get(),
    database.select({ n: count() }).from(cloudAccounts).get(),
  ])

  // Engines breakdown
  const allAgents = await database.select({ bot_engine: agents.bot_engine }).from(agents).all()
  const engineCount: Record<string, number> = {}
  for (const a of allAgents) {
    engineCount[a.bot_engine] = (engineCount[a.bot_engine] ?? 0) + 1
  }

  // Presets breakdown
  const presetCount: Record<string, number> = {}
  const allPresets = await database.select({ soul_preset: agents.soul_preset }).from(agents).all()
  for (const a of allPresets) {
    presetCount[a.soul_preset] = (presetCount[a.soul_preset] ?? 0) + 1
  }

  // Providers breakdown
  const providerCount: Record<string, number> = {}
  const allProviders = await database.select({ provider: cloudAccounts.provider }).from(cloudAccounts).all()
  for (const a of allProviders) {
    providerCount[a.provider] = (providerCount[a.provider] ?? 0) + 1
  }

  return c.json({
    users:            totalUsers?.n ?? 0,
    agents:           totalAgents?.n ?? 0,
    deployments:      totalDeployments?.n ?? 0,
    live_deployments: liveDeployments?.n ?? 0,
    failed_deployments: failedDeployments?.n ?? 0,
    cloud_accounts:   totalCloudAccounts?.n ?? 0,
    engines:          engineCount,
    presets:          presetCount,
    providers:        providerCount,
  })
})

// GET /admin/users — all users with their agent + deployment counts
router.get('/users', async (c) => {
  const auth  = getAuth(c)
  const email = auth?.sessionClaims?.email as string | undefined
  if (!requireAdmin(c.env.ADMIN_EMAILS, email)) return c.json({ error: 'Forbidden' }, 403)

  const database = db(c.env.DB)
  const allUsers = await database.select().from(users).orderBy(desc(users.created_at)).all()

  const enriched = await Promise.all(allUsers.map(async u => {
    const [agentCount, deployCount, liveCount] = await Promise.all([
      database.select({ n: count() }).from(agents).where(eq(agents.user_id, u.id)).get(),
      database.select({ n: count() }).from(deployments).where(eq(deployments.user_id, u.id)).get(),
      database.select({ n: count() }).from(deployments)
        .where(and(eq(deployments.user_id, u.id), eq(deployments.status, 'live'))).get(),
    ])
    return {
      id:          u.id,
      email:       u.email,
      created_at:  u.created_at,
      agents:      agentCount?.n ?? 0,
      deployments: deployCount?.n ?? 0,
      live_bots:   liveCount?.n ?? 0,
    }
  }))

  return c.json(enriched)
})

// GET /admin/deployments — recent deployments across all users
router.get('/deployments', async (c) => {
  const auth  = getAuth(c)
  const email = auth?.sessionClaims?.email as string | undefined
  if (!requireAdmin(c.env.ADMIN_EMAILS, email)) return c.json({ error: 'Forbidden' }, 403)

  const database = db(c.env.DB)
  const rows = await database.select({
    id:           deployments.id,
    agent_id:     deployments.agent_id,
    user_id:      deployments.user_id,
    provider:     deployments.provider,
    status:       deployments.status,
    external_url: deployments.external_url,
    error_message: deployments.error_message,
    created_at:   deployments.created_at,
    agent_name:   agents.name,
    bot_engine:   agents.bot_engine,
    soul_preset:  agents.soul_preset,
    user_email:   users.email,
  })
  .from(deployments)
  .leftJoin(agents, eq(deployments.agent_id, agents.id))
  .leftJoin(users,  eq(deployments.user_id, users.id))
  .orderBy(desc(deployments.created_at))
  .limit(50)
  .all()

  return c.json(rows)
})

export default router
