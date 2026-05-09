import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

// Get pending requests
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('device_id')

    if (deviceId) {
      // Return requests for specific device with queue position
      const requests = await sql`
        SELECT *, 
          ROW_NUMBER() OVER (ORDER BY created_at ASC) as queue_position
        FROM song_requests 
        WHERE status = 'pending' AND device_id = ${deviceId}
        ORDER BY created_at ASC
      `
      return NextResponse.json(requests)
    }

    const requests = await sql`
      SELECT * FROM song_requests 
      WHERE status = 'pending'
      ORDER BY created_at ASC
    `
    return NextResponse.json(requests)
  } catch (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}

// Create new request
export async function POST(request: Request) {
  try {
    const { youtube_id, title, thumbnail, duration, requested_by, device_id } = await request.json()
    
    // Check if song is already in queue
    const existing = await sql`
      SELECT * FROM song_requests 
      WHERE youtube_id = ${youtube_id} AND status = 'pending'
    `
    
    if (existing.length > 0) {
      return NextResponse.json({ error: 'เพลงนี้อยู่ในคิวแล้ว' }, { status: 400 })
    }
    
    const result = await sql`
      INSERT INTO song_requests (youtube_id, title, thumbnail, duration, requested_by, device_id, status)
      VALUES (${youtube_id}, ${title}, ${thumbnail}, ${duration}, ${requested_by || 'ลูกค้า'}, ${device_id || null}, 'pending')
      RETURNING *
    `
    
    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error creating request:', error)
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
  }
}

// Update request status
export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json()
    
    const updateFields = status === 'played' 
      ? sql`status = ${status}, played_at = NOW()`
      : sql`status = ${status}`
    
    const result = await sql`
      UPDATE song_requests 
      SET ${updateFields}
      WHERE id = ${id}
      RETURNING *
    `
    
    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error updating request:', error)
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
  }
}

// Delete request
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    await sql`DELETE FROM song_requests WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting request:', error)
    return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 })
  }
}
