import postgres from 'postgres'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not set. Create .env.local in the project root and add DATABASE_URL="postgresql://...".'
  )
}

export const sql = postgres(databaseUrl)
