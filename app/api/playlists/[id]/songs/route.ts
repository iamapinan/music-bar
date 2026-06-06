import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const songs = await sql`
      SELECT * FROM playlist_songs 
      WHERE playlist_id = ${parseInt(id)}
      ORDER BY position ASC, created_at ASC
    `
    return NextResponse.json(songs)
  } catch (error) {
    console.error('Error fetching playlist songs:', error)
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { youtube_id, title, thumbnail, duration, artist } = await request.json()
    const playlistId = parseInt(id)
    const youtubeId = typeof youtube_id === 'string' ? youtube_id.trim() : ''
    const songTitle = typeof title === 'string' ? title.trim() : ''

    if (!Number.isFinite(playlistId)) {
      return NextResponse.json({ error: 'ไม่พบ playlist ที่ต้องการเพิ่มเพลง' }, { status: 400 })
    }

    if (!youtubeId || !songTitle) {
      return NextResponse.json({ error: 'ข้อมูลเพลงไม่ครบ กรุณาค้นหาและเลือกเพลงใหม่อีกครั้ง' }, { status: 400 })
    }
    
    // Get max position
    const maxPos = await sql`
      SELECT COALESCE(MAX(position), 0) as max_pos 
      FROM playlist_songs 
      WHERE playlist_id = ${playlistId}
    `
    
    const result = await sql`
      INSERT INTO playlist_songs (playlist_id, youtube_id, title, thumbnail, duration, artist, position)
      VALUES (${playlistId}, ${youtubeId}, ${songTitle}, ${thumbnail || null}, ${duration || null}, ${artist || null}, ${(maxPos[0]?.max_pos || 0) + 1})
      RETURNING *
    `
    
    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error adding song to playlist:', error)
    return NextResponse.json({ error: 'Failed to add song' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { songId } = await request.json()
    
    await sql`DELETE FROM playlist_songs WHERE id = ${songId} AND playlist_id = ${parseInt(id)}`
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting song:', error)
    return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 })
  }
}
