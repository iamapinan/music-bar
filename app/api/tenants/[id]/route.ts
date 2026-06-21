import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { cacheKey, invalidateCache } from '@/lib/cache'
import { getSessionUser } from '@/lib/auth/session'
import {
  getUserTenantRole,
  isSuperAdminEmail,
  normalizeTenantSlug,
  upsertUserFromSession,
} from '@/lib/tenancy'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await upsertUserFromSession(sessionUser)
    const isSuperAdmin = isSuperAdminEmail(user.email)
    const role = isSuperAdmin ? 'owner' : await getUserTenantRole(user.id, id)

    // Only owners or admins can edit store settings (or super admins)
    if (!role || (role !== 'owner' && role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, slug, is_active } = body

    // Fetch the current tenant state
    const currentTenant = await sql`
      SELECT * FROM tenants WHERE id = ${id} LIMIT 1
    `
    if (currentTenant.length === 0) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    let nextName = currentTenant[0].name
    let nextDisplayName = currentTenant[0].display_name
    if (typeof name === 'string' && name.trim()) {
      nextName = name.trim()
      nextDisplayName = name.trim()
    }

    let nextSlug = currentTenant[0].slug
    if (typeof slug === 'string' && slug.trim()) {
      const normalized = normalizeTenantSlug(slug)
      if (!normalized) {
        return NextResponse.json({ error: 'Invalid store slug' }, { status: 400 })
      }

      // Check for collision with another store
      const collision = await sql`
        SELECT id FROM tenants WHERE slug = ${normalized} AND id != ${id} LIMIT 1
      `
      if (collision.length > 0) {
        return NextResponse.json(
          { error: 'ชื่อสลัก (slug) นี้ถูกร้านอื่นใช้งานแล้ว' },
          { status: 400 },
        )
      }
      nextSlug = normalized
    }

    let nextIsActive = currentTenant[0].is_active
    if (typeof is_active === 'boolean') {
      nextIsActive = is_active
    }

    // Execute update
    const updated = await sql`
      UPDATE tenants
      SET name = ${nextName},
          display_name = ${nextDisplayName},
          slug = ${nextSlug},
          is_active = ${nextIsActive},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    await invalidateCache([
      cacheKey('tenant', 'id', id),
      cacheKey('tenant', 'slug', currentTenant[0].slug),
      cacheKey('tenant', 'slug', nextSlug),
      cacheKey('stations'),
    ])

    return NextResponse.json(updated[0])
  } catch (error) {
    console.error('Error updating tenant:', error)
    return NextResponse.json({ error: 'Failed to update tenant settings' }, { status: 500 })
  }
}
