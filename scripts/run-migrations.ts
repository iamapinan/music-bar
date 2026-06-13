#!/usr/bin/env tsx
/**
 * Music Bar — Database Migration Runner
 *
 * Reads all `.sql` files from `database/migrations/` in order (001_*, 002_*, …)
 * and applies each one that hasn't been recorded in the `_migrations` tracking table.
 *
 * Usage:
 *   npx tsx scripts/run-migrations.ts
 *
 * Add new migrations as `database/migrations/007_*.sql`, etc.
 * Migrations are idempotent (should use IF NOT EXISTS / IF EXISTS).
 */

import { readdirSync, readFileSync } from 'fs'
import { join, parse } from 'path'
import { sql } from '@/lib/db'

const MIGRATIONS_DIR = join(__dirname, '..', 'database', 'migrations')

async function main() {
  // Ensure tracking table exists
  await sql`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  // Read applied migrations
  const applied = new Set(
    (await sql<{ name: string }[]>`SELECT name FROM _migrations ORDER BY id`).map(r => r.name)
  )

  // Read migration files
  const files = readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort()

  let count = 0

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`✓ ${file} (already applied)`)
      continue
    }

    const name = parse(file).name
    const sqlContent = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8')

    console.log(`→ Applying ${file}...`)

    try {
      await sql.unsafe(sqlContent)
      await sql`INSERT INTO _migrations (name) VALUES (${file})`
      console.log(`✓ ${file} applied successfully`)
      count++
    } catch (err: any) {
      console.error(`✗ ${file} FAILED: ${err.message}`)
      process.exit(1)
    }
  }

  if (count === 0) {
    console.log('No pending migrations.')
  } else {
    console.log(`\nApplied ${count} migration(s).`)
  }

  process.exit(0)
}

main().catch(err => {
  console.error('Migration runner error:', err)
  process.exit(1)
})
