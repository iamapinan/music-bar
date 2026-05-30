import { neon } from '@neondatabase/serverless'

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set')
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)
  
  try {
    console.log('Creating active_players table...')
    await sql`
      CREATE TABLE IF NOT EXISTS active_players (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        device_id VARCHAR(255) UNIQUE NOT NULL,
        device_name VARCHAR(255) NOT NULL,
        device_type VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        last_ping TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('Table active_players created successfully!')
  } catch (error) {
    console.error('Error creating table:', error)
  }
}

main()
