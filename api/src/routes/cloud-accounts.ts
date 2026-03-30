import { Hono } from 'hono'
import { eq, and } from 'drizzle-orm'
import { db, cloudAccounts } from '../db'
import { encrypt } from '../lib/crypto'
import type { Bindings } from '../types'

const router = new Hono<{ Bindings: Bindings }>()

// GET /v1/cloud-accounts
router.get('/', async (c) => {
  const userId = c.get('userId' as never) as string
  const rows = await db(c.env.DB)
    .select()
    .from(cloudAccounts)
    .where(eq(cloudAccounts.user_id, userId))
    .all()

  // Return without encrypted credentials
  return c.json(rows.map(({ credentials_enc, ...rest }) => rest))
})

// POST /v1/cloud-accounts
router.post('/', async (c) => {
  const userId = c.get('userId' as never) as string
  const body   = await c.req.json()

  // Encrypt each credential field individually
  const encryptedFields: Record<string, string> = {}
  for (const [key, value] of Object.entries(body.credentials as Record<string, string>)) {
    encryptedFields[key] = await encrypt(value, c.env.ENCRYPTION_KEY)
  }

  const id = crypto.randomUUID()
  await db(c.env.DB).insert(cloudAccounts).values({
    id,
    user_id:         userId,
    provider:        body.provider,
    display_name:    body.display_name,
    credentials_enc: JSON.stringify(encryptedFields),
  }).run()

  return c.json({ id, provider: body.provider, display_name: body.display_name, is_valid: null }, 201)
})

// DELETE /v1/cloud-accounts/:id
router.delete('/:id', async (c) => {
  const userId = c.get('userId' as never) as string
  await db(c.env.DB).delete(cloudAccounts)
    .where(and(eq(cloudAccounts.id, c.req.param('id')), eq(cloudAccounts.user_id, userId)))
    .run()
  return c.body(null, 204)
})

export default router
