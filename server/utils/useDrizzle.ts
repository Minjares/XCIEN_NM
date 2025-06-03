export { sql, eq, and, or } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../database/schema'

export const tables = schema


const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is missing');

const client = postgres(url, { prepare: false })
export const db = drizzle({ client, schema })


let dbInstance: ReturnType<typeof drizzle> | null = null

export function useDrizzle() {
  if (!dbInstance) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is missing');
    const client = postgres(url, { prepare: false })
    dbInstance = drizzle({ client, schema })
  }
  return dbInstance
}