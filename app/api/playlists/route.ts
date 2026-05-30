import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const playlists = await sql`
      SELECT p.*, 
        (SELECT COUNT(*) FROM playlist_songs WHERE playlist_id = p.id) as song_count,
        (SELECT thumbnail FROM playlist_songs WHERE playlist_id = p.id ORDER BY position ASC, created_at ASC LIMIT 1) as cover_thumbnail
      FROM playlists p 
      ORDER BY p.is_default DESC, p.created_at DESC
    `
    return NextResponse.json(playlists)
  } catch (error) {
    console.error('Error fetching playlists:', error)
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, description } = await request.json()
    
    const result = await sql`
      INSERT INTO playlists (name, description, is_enabled)
      VALUES (${name}, ${description}, true)
      RETURNING *
    `
    
    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error creating playlist:', error)
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, is_default, is_enabled, name, description } = body
    
    if (is_default !== undefined) {
      // If setting as default, first unset all others
      if (is_default) {
        await sql`UPDATE playlists SET is_default = false WHERE is_default = true`
      }
      await sql`UPDATE playlists SET is_default = ${is_default}, updated_at = NOW() WHERE id = ${id}`
    }
    
    if (is_enabled !== undefined) {
      await sql`UPDATE playlists SET is_enabled = ${is_enabled}, updated_at = NOW() WHERE id = ${id}`
    }
    
    if (name !== undefined) {
      await sql`UPDATE playlists SET name = ${name}, updated_at = NOW() WHERE id = ${id}`
    }
    
    if (description !== undefined) {
      await sql`UPDATE playlists SET description = ${description}, updated_at = NOW() WHERE id = ${id}`
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating playlist:', error)
    return NextResponse.json({ error: 'Failed to update playlist' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    
    await sql`DELETE FROM playlists WHERE id = ${id}`
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting playlist:', error)
    return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 })
  }
}
