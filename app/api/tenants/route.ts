import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { cacheKey, invalidateCache } from '@/lib/cache'
import { getSessionUser, setActiveTenantCookie } from '@/lib/auth/session'
import {
  getMembershipsForUser,
  isSuperAdminEmail,
  normalizeTenantSlug,
  seedTenantDefaults,
  upsertUserFromSession,
  userCanAccessAdmin,
} from '@/lib/tenancy'

export async function GET() {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await upsertUserFromSession(sessionUser)
    const canAccessAdmin = await userCanAccessAdmin(user)
    if (!canAccessAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const tenants = await getMembershipsForUser(user)
    return NextResponse.json(tenants)
  } catch (error) {
    console.error('Error listing tenants:', error)
    return NextResponse.json({ error: 'Failed to list tenants' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, slug } = await request.json()
    const tenantName = typeof name === 'string' && name.trim() ? name.trim() : 'Music Bar'
    const tenantSlug = normalizeTenantSlug(typeof slug === 'string' && slug.trim() ? slug : tenantName)

    if (!tenantSlug) {
      return NextResponse.json({ error: 'Invalid tenant slug' }, { status: 400 })
    }

    const user = await upsertUserFromSession(sessionUser)
    if (!isSuperAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Only super admin can create stores' }, { status: 403 })
    }

    const tenant = await sql`
      INSERT INTO tenants (slug, name, display_name, created_by_user_id)
      VALUES (${tenantSlug}, ${tenantName}, ${tenantName}, ${user.id})
      RETURNING *
    `

    await sql`
      INSERT INTO tenant_memberships (tenant_id, user_id, role)
      VALUES (${tenant[0].id}, ${user.id}, 'owner')
    `
    await seedTenantDefaults(tenant[0].id)
    await setActiveTenantCookie(tenant[0].id)
    await invalidateCache([
      cacheKey('tenant', 'id', tenant[0].id),
      cacheKey('tenant', 'slug', tenant[0].slug),
      cacheKey('stations'),
      cacheKey('user-memberships', user.id),
    ])

    return NextResponse.json(tenant[0])
  } catch (error) {
    console.error('Error creating tenant:', error)
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 })
  }
}
