import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    const players = await sql`
      SELECT * FROM active_players
      ORDER BY is_active DESC, last_ping DESC
    `
    return NextResponse.json(players)
  } catch (error) {
    console.error('Failed to fetch players:', error)
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { device_id, device_name, device_type } = await request.json()

    if (!device_id || !device_name || !device_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO active_players (device_id, device_name, device_type, last_ping)
      VALUES (${device_id}, ${device_name}, ${device_type}, CURRENT_TIMESTAMP)
      ON CONFLICT (device_id) 
      DO UPDATE SET 
        device_name = EXCLUDED.device_name,
        device_type = EXCLUDED.device_type,
        last_ping = CURRENT_TIMESTAMP
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Failed to ping player:', error)
    return NextResponse.json({ error: 'Failed to ping player' }, { status: 500 })
  }
}
