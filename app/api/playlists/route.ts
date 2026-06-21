import { sql } from '@/lib/db'
import { cachedJson, cacheHeaders, cacheKey, invalidateCache } from '@/lib/cache'
import { isTenantError, requireTenantContext } from '@/lib/tenancy'
import { NextResponse } from 'next/server'
import { getProxiedUrl } from '@/lib/images'

export async function GET(request: Request) {
  const startedAt = Date.now()
  try {
    const ctx = await requireTenantContext(request, { public: true })
    if (isTenantError(ctx)) return ctx

    const result = await cachedJson(cacheKey('playlists', ctx.tenant.id), 60, () => sql`
      SELECT p.*,
        (SELECT COUNT(*) FROM playlist_songs WHERE playlist_id = p.id AND tenant_id = ${ctx.tenant.id}) as song_count,
        (SELECT thumbnail FROM playlist_songs WHERE playlist_id = p.id AND tenant_id = ${ctx.tenant.id} ORDER BY position ASC, created_at ASC LIMIT 1) as cover_thumbnail
      FROM playlists p
      WHERE p.tenant_id = ${ctx.tenant.id}
      ORDER BY p.is_default DESC, p.created_at DESC
    `)
    const { origin } = new URL(request.url)
    const playlists = (result.data as any[]).map(p => ({
      ...p,
      cover_thumbnail: p.cover_thumbnail ? getProxiedUrl(p.cover_thumbnail, origin) : p.cover_thumbnail
    }))

    return NextResponse.json(playlists, { headers: cacheHeaders(result.cache, startedAt) })
  } catch (error) {
    console.error('Error fetching playlists:', error)
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireTenantContext(request, { roles: ['owner', 'admin'] })
    if (isTenantError(ctx)) return ctx

    const { name, description } = await request.json()
    const result = await sql`
      INSERT INTO playlists (tenant_id, name, description, is_enabled)
      VALUES (${ctx.tenant.id}, ${name}, ${description || null}, true)
      RETURNING *
    `
    await invalidateCache([
      cacheKey('playlists', ctx.tenant.id),
      cacheKey('stations'),
    ])

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error creating playlist:', error)
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const ctx = await requireTenantContext(request, { roles: ['owner', 'admin'] })
    if (isTenantError(ctx)) return ctx

    const body = await request.json()
    const { id, is_default, is_enabled, name, description } = body

    if (is_default !== undefined) {
      if (is_default) {
        await sql`UPDATE playlists SET is_default = false WHERE tenant_id = ${ctx.tenant.id} AND is_default = true`
        await sql`
          INSERT INTO app_settings (tenant_id, key, value, updated_at)
          VALUES (${ctx.tenant.id}, 'active_playlist_ids', ${JSON.stringify([])}, NOW())
          ON CONFLICT (tenant_id, key) DO UPDATE
          SET value = EXCLUDED.value, updated_at = NOW()
        `
      }
      await sql`
        UPDATE playlists
        SET is_default = ${is_default}, updated_at = NOW()
        WHERE id = ${id} AND tenant_id = ${ctx.tenant.id}
      `
    }

    if (is_enabled !== undefined) {
      await sql`
        UPDATE playlists
        SET is_enabled = ${is_enabled}, updated_at = NOW()
        WHERE id = ${id} AND tenant_id = ${ctx.tenant.id}
      `
    }

    if (name !== undefined) {
      await sql`
        UPDATE playlists
        SET name = ${name}, updated_at = NOW()
        WHERE id = ${id} AND tenant_id = ${ctx.tenant.id}
      `
    }

    if (description !== undefined) {
      await sql`
        UPDATE playlists
        SET description = ${description}, updated_at = NOW()
        WHERE id = ${id} AND tenant_id = ${ctx.tenant.id}
      `
    }

    await invalidateCache([
      cacheKey('playlists', ctx.tenant.id),
      cacheKey('settings', ctx.tenant.id),
      cacheKey('playlist-songs', ctx.tenant.id, id),
      cacheKey('stations'),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating playlist:', error)
    return NextResponse.json({ error: 'Failed to update playlist' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const ctx = await requireTenantContext(request, { roles: ['owner', 'admin'] })
    if (isTenantError(ctx)) return ctx

    const { id } = await request.json()
    await sql`DELETE FROM playlists WHERE id = ${id} AND tenant_id = ${ctx.tenant.id}`
    await invalidateCache([
      cacheKey('playlists', ctx.tenant.id),
      cacheKey('playlist-songs', ctx.tenant.id, id),
      cacheKey('stations'),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting playlist:', error)
    return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 })
  }
}
