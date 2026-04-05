import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import type { Bindings } from './types'
import { clerkAuth, requireUser } from './middleware/auth'
import agentsRouter        from './routes/agents'
import cloudAccountsRouter  from './routes/cloud-accounts'
import deploymentsRouter    from './routes/deployments'
import adminRouter          from './routes/admin'

const app = new Hono<{ Bindings: Bindings }>()

// Global middleware
app.use('*', logger())
app.use('*', cors({ origin: ['http://localhost:5173', 'https://adaimade-web.pages.dev', 'https://adaimade.com'] }))
app.use('/v1/*', clerkAuth())    // verify JWT
app.use('/v1/*', requireUser)    // upsert user to D1

// Health check (public)
app.get('/health', c => c.json({ status: 'ok' }))

// API routes
app.route('/v1/agents',         agentsRouter)
app.route('/v1/cloud-accounts', cloudAccountsRouter)
app.route('/v1/deployments',    deploymentsRouter)
app.route('/v1/admin',          adminRouter)

export default app
