import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'

// Creates a Drizzle client bound to the D1 instance
export function db(d1: D1Database) {
  return drizzle(d1, { schema })
}

export * from './schema'
