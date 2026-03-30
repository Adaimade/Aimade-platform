import { createMiddleware } from 'hono/factory'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import type { Bindings } from '../types'
import { db, users } from '../db'
import { eq } from 'drizzle-orm'

// Step 1: Verify Clerk JWT (attach to every route)
export const clerkAuth = () => clerkMiddleware()

// Step 2: Extract user + upsert to D1
export const requireUser = createMiddleware<{ Bindings: Bindings }>(
  async (c, next) => {
    const auth = getAuth(c)
    console.log('[requireUser] auth:', JSON.stringify(auth))
    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const database = db(c.env.DB)

    // Upsert: create user row if first time
    const existing = await database.select()
      .from(users)
      .where(eq(users.id, auth.userId))
      .get()

    if (!existing) {
      await database.insert(users).values({
        id:    auth.userId,
        email: auth.sessionClaims?.email as string ?? '',
      }).run()
    }

    // Attach userId to context for downstream handlers
    c.set('userId' as never, auth.userId)
    await next()
  }
)
