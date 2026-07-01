import { sql } from '@/lib/db'
import { cachedJson, cacheHeaders, cacheKey, invalidateCache } from '@/lib/cache'
import { isTenantError, requireTenantContext } from '@/lib/tenancy'
import { NextResponse } from 'next/server'

// Settings keys that are safe to expose publicly
const PUBLIC_SETTINGS = new Set(['is_requests_enabled', 'active_playlist_ids'])

export async function GET(request: Request) {
  const startedAt = Date.now()
  try {
    // Try admin access first — returns all settings
    const adminCtx = await requireTenantContext(request, { roles: ['owner', 'admin'] })
    if (!isTenantError(adminCtx)) {
      const result = await cachedJson(cacheKey('settings', adminCtx.tenant.id), 30, async () => {
        const settings = await sql`
        SELECT key, value FROM app_settings
        WHERE tenant_id = ${adminCtx.tenant.id}
        `
        return settings.reduce((acc: any, row: any) => {
          acc[row.key] = row.value
          return acc
        }, {})
      })
      return NextResponse.json(result.data, { headers: cacheHeaders(result.cache, startedAt) })
    }

    // Public access — only return safe settings
    const publicCtx = await requireTenantContext(request, { public: true })
    if (isTenantError(publicCtx)) return publicCtx

    const result = await cachedJson(cacheKey('settings', 'public', publicCtx.tenant.id), 30, async () => {
      const settings = await sql`
      SELECT key, value FROM app_settings
      WHERE tenant_id = ${publicCtx.tenant.id}
        AND key = ANY(${Array.from(PUBLIC_SETTINGS)})
      `
      return settings.reduce((acc: any, row: any) => {
        acc[row.key] = row.value
        return acc
      }, {})
    })
    return NextResponse.json(result.data, { headers: cacheHeaders(result.cache, startedAt) })
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const ctx = await requireTenantContext(request, { roles: ['owner', 'admin'] })
    if (isTenantError(ctx)) return ctx

    const { key, value } = await request.json()
    await sql`
      INSERT INTO app_settings (tenant_id, key, value, updated_at)
      VALUES (${ctx.tenant.id}, ${key}, ${JSON.stringify(value)}, NOW())
      ON CONFLICT (tenant_id, key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW()
    `
    await invalidateCache([
      cacheKey('settings', ctx.tenant.id),
      cacheKey('settings', 'public', ctx.tenant.id),
      cacheKey('playlists', ctx.tenant.id),
    ])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update setting:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}
