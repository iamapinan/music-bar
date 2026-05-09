import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const settings = await sql`SELECT key, value FROM app_settings`
    const settingsMap = settings.reduce((acc: any, row: any) => {
      acc[row.key] = row.value
      return acc
    }, {})
    return NextResponse.json(settingsMap)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { key, value } = await request.json()
    await sql`
      INSERT INTO app_settings (key, value, updated_at)
      VALUES (${key}, ${JSON.stringify(value)}, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW()
    `
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}
