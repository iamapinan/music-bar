import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { is_active, device_name } = await request.json()
    
    // We can update either is_active or device_name, so we build the query dynamically or just check what is provided
    if (is_active !== undefined) {
      const result = await sql`
        UPDATE active_players 
        SET is_active = ${is_active}
        WHERE id = ${id}
        RETURNING *
      `
      return NextResponse.json(result[0] || {})
    }

    if (device_name !== undefined) {
      const result = await sql`
        UPDATE active_players 
        SET device_name = ${device_name}
        WHERE id = ${id}
        RETURNING *
      `
      return NextResponse.json(result[0] || {})
    }

    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  } catch (error) {
    console.error('Failed to update player:', error)
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await sql`
      DELETE FROM active_players
      WHERE id = ${id}
    `
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete player:', error)
    return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 })
  }
}
