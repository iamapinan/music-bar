import postgres from 'postgres'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not set. Create .env.local in the project root and add DATABASE_URL="postgresql://...".'
  )
}

export const sql = postgres(databaseUrl, {
  max: Number(process.env.DATABASE_POOL_MAX || 5),
  idle_timeout: Number(process.env.DATABASE_IDLE_TIMEOUT_SECONDS || 20),
  connect_timeout: Number(process.env.DATABASE_CONNECT_TIMEOUT_SECONDS || 10),
  prepare: false,
})
