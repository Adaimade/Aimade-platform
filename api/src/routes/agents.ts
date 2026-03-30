import { Hono } from 'hono'
import { eq, and } from 'drizzle-orm'
import { db, agents } from '../db'
import { encrypt } from '../lib/crypto'
import type { Bindings } from '../types'

const router = new Hono<{ Bindings: Bindings }>()

// GET /v1/agents
router.get('/', async (c) => {
  const userId = c.get('userId' as never) as string
  const rows = await db(c.env.DB)
    .select()
    .from(agents)
    .where(eq(agents.user_id, userId))
    .all()

  return c.json(rows.map(row => ({
    ...row,
    personality: JSON.parse(row.personality),
    skills:      JSON.parse(row.skills),
    llm_api_key_enc: undefined,  // never expose
  })))
})

// POST /v1/agents
router.post('/', async (c) => {
  const userId = c.get('userId' as never) as string
  const body   = await c.req.json()

  const id = crypto.randomUUID()
  const llm_api_key_enc = await encrypt(body.llm_api_key, c.env.ENCRYPTION_KEY)

  await db(c.env.DB).insert(agents).values({
    id,
    user_id:         userId,
    name:            body.name,
    description:     body.description ?? null,
    personality:     JSON.stringify(body.personality),
    skills:          JSON.stringify(body.skills),
    llm_provider:    body.llm_provider,
    llm_model:       body.llm_model,
    llm_api_key_enc,
    bot_engine:      body.bot_engine ?? 'standard',
  }).run()

  return c.json({ id, status: 'draft' }, 201)
})

// GET /v1/agents/:id
router.get('/:id', async (c) => {
  const userId = c.get('userId' as never) as string
  const row = await db(c.env.DB).select().from(agents)
    .where(and(eq(agents.id, c.req.param('id')), eq(agents.user_id, userId))).get()
  if (!row) return c.json({ error: 'Not found' }, 404)
  return c.json({
    ...row,
    personality: JSON.parse(row.personality),
    skills:      JSON.parse(row.skills),
    llm_api_key_enc: undefined,
  })
})

// DELETE /v1/agents/:id
router.delete('/:id', async (c) => {
  const userId = c.get('userId' as never) as string
  await db(c.env.DB).delete(agents)
    .where(and(eq(agents.id, c.req.param('id')), eq(agents.user_id, userId)))
    .run()
  return c.body(null, 204)
})

export default router
