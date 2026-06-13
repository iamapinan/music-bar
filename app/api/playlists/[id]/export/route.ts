import { sql } from '@/lib/db'
import { isTenantError, requireTenantContext } from '@/lib/tenancy'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = await requireTenantContext(request, { roles: ['owner', 'admin', 'staff'] })
    if (isTenantError(ctx)) return ctx

    const { id } = await params
    const playlistId = parseInt(id)

    const playlist = await sql`
      SELECT * FROM playlists
      WHERE id = ${playlistId}
        AND tenant_id = ${ctx.tenant.id}
    `

    if (!playlist.length) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
    }

    const songs = await sql`
      SELECT * FROM playlist_songs
      WHERE playlist_id = ${playlistId}
        AND tenant_id = ${ctx.tenant.id}
      ORDER BY position ASC, created_at ASC
    `

    const header = 'No,Title,Artist,YouTube ID,YouTube URL'
    const rows = songs.map((song, index) =>
      `${index + 1},"${(song.title as string).replace(/"/g, '""')}","${((song.artist as string) || '').replace(/"/g, '""')}",${song.youtube_id},https://youtube.com/watch?v=${song.youtube_id}`
    )
    const csv = [header, ...rows].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${(playlist[0].name as string).replace(/[^a-z0-9]/gi, '_')}_songs.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting playlist:', error)
    return NextResponse.json({ error: 'Failed to export playlist' }, { status: 500 })
  }
}
