import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/db'
import { ACTIVE_TENANT_COOKIE_NAME, getSessionUser, setActiveTenantCookie, type SessionUser } from '@/lib/auth/session'

export type TenantRole = 'owner' | 'admin' | 'staff'

export type Tenant = {
  id: string
  slug: string
  name: string
  display_name: string | null
  logo_url: string | null
  is_active: boolean
}

export type TenantMembership = {
  tenant_id: string
  role: TenantRole
  slug: string
  name: string
  display_name: string | null
  logo_url: string | null
}

export type DbUser = {
  id: string
  firebase_uid: string
  email: string
  name: string | null
  photo_url: string | null
}

export type TenantContext = {
  tenant: Tenant
  user: DbUser | null
  role: TenantRole | null
  sessionUser: SessionUser | null
  isSuperAdmin: boolean
}

const allowedSlug = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/
const superAdminEmails = new Set(
  (process.env.SUPER_ADMIN_EMAILS || 'iamapinan@gmail.com')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean),
)

export function isSuperAdminEmail(email: string | null | undefined) {
  return !!email && superAdminEmails.has(email.toLowerCase())
}

export function normalizeTenantSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export async function upsertUserFromSession(sessionUser: SessionUser) {
  if (!sessionUser.email) {
    throw new Error('Firebase account does not include an email address')
  }

  const result = await sql<DbUser[]>`
    INSERT INTO users (firebase_uid, email, name, photo_url, last_login_at)
    VALUES (${sessionUser.firebaseUid}, ${sessionUser.email}, ${sessionUser.name}, ${sessionUser.picture}, NOW())
    ON CONFLICT (email) DO UPDATE
    SET firebase_uid = EXCLUDED.firebase_uid,
        name = COALESCE(EXCLUDED.name, users.name),
        photo_url = COALESCE(EXCLUDED.photo_url, users.photo_url),
        last_login_at = NOW(),
        updated_at = NOW()
    RETURNING *
  `

  return result[0]
}

export async function getMemberships(userId: string) {
  return sql<TenantMembership[]>`
    SELECT
      tm.tenant_id,
      tm.role,
      t.slug,
      t.name,
      t.display_name,
      t.logo_url,
      t.is_active
    FROM tenant_memberships tm
    JOIN tenants t ON t.id = tm.tenant_id
    WHERE tm.user_id = ${userId}
    ORDER BY t.created_at ASC
  `
}

export async function getMembershipsForUser(user: DbUser) {
  if (isSuperAdminEmail(user.email)) {
    return sql<TenantMembership[]>`
      SELECT
        t.id as tenant_id,
        'owner'::varchar as role,
        t.slug,
        t.name,
        t.display_name,
        t.logo_url,
        t.is_active
      FROM tenants t
      ORDER BY t.created_at ASC
    `
  }

  await applyAdminGrants(user)
  return getMemberships(user.id)
}

export async function applyAdminGrants(user: DbUser) {
  await sql`
    INSERT INTO tenant_memberships (tenant_id, user_id, role)
    SELECT tenant_id, ${user.id}, role
    FROM admin_grants
    WHERE lower(email) = lower(${user.email})
    ON CONFLICT (tenant_id, user_id) DO UPDATE
    SET role = EXCLUDED.role
  `
}

export async function ensureInitialTenantForUser(user: DbUser) {
  await applyAdminGrants(user)
  const memberships = await getMembershipsForUser(user)
  if (memberships.length > 0) return memberships

  if (!isSuperAdminEmail(user.email)) return []

  const existingTenants = await sql<Tenant[]>`
    SELECT * FROM tenants
    WHERE is_active = true
    ORDER BY created_at ASC
    LIMIT 1
  `

  if (existingTenants.length > 0) {
    const existingMembers = await sql`SELECT id FROM tenant_memberships LIMIT 1`
    if (existingMembers.length === 0) {
      await sql`
        INSERT INTO tenant_memberships (tenant_id, user_id, role)
        VALUES (${existingTenants[0].id}, ${user.id}, 'owner')
        ON CONFLICT (tenant_id, user_id) DO NOTHING
      `
      return getMemberships(user.id)
    }
    return memberships
  }

  const slug = normalizeTenantSlug(user.name || user.email.split('@')[0] || 'main') || 'main'
  const tenant = await sql<Tenant[]>`
    INSERT INTO tenants (slug, name, display_name, created_by_user_id)
    VALUES (${slug}, ${user.name || 'Music Bar'}, ${user.name || 'Music Bar'}, ${user.id})
    RETURNING *
  `
  await sql`
    INSERT INTO tenant_memberships (tenant_id, user_id, role)
    VALUES (${tenant[0].id}, ${user.id}, 'owner')
  `
  await seedTenantDefaults(tenant[0].id)
  return getMemberships(user.id)
}

export async function seedTenantDefaults(tenantId: string) {
  await sql`
    INSERT INTO app_settings (tenant_id, key, value, updated_at)
    VALUES
      (${tenantId}, 'is_requests_enabled', 'true', NOW()),
      (${tenantId}, 'active_playlist_ids', '[]', NOW())
    ON CONFLICT (tenant_id, key) DO NOTHING
  `
}

export async function getTenantBySlug(slug: string) {
  if (!allowedSlug.test(slug)) return null
  const tenants = await sql<Tenant[]>`
    SELECT * FROM tenants
    WHERE slug = ${slug}
    LIMIT 1
  `
  return tenants[0] || null
}

export async function getTenantById(id: string) {
  const tenants = await sql<Tenant[]>`
    SELECT * FROM tenants
    WHERE id = ${id}
    LIMIT 1
  `
  return tenants[0] || null
}

export async function getUserTenantRole(userId: string, tenantId: string) {
  const rows = await sql<{ role: TenantRole }[]>`
    SELECT role FROM tenant_memberships
    WHERE user_id = ${userId}
      AND tenant_id = ${tenantId}
    LIMIT 1
  `
  return rows[0]?.role || null
}

export async function userCanAccessAdmin(user: DbUser) {
  if (isSuperAdminEmail(user.email)) return true
  await applyAdminGrants(user)
  const memberships = await getMemberships(user.id)
  return memberships.length > 0
}

function getTenantSlugFromRequest(request: Request) {
  const url = new URL(request.url)
  const fromQuery = url.searchParams.get('tenant') || url.searchParams.get('tenantSlug')
  if (fromQuery) return fromQuery

  const header = request.headers.get('x-tenant-slug')
  if (header) return header

  const match = url.pathname.match(/\/play\/([^/]+)/)
  return match?.[1] || null
}

export async function requireTenantContext(
  request: Request,
  options: { public?: boolean; roles?: TenantRole[] } = {},
): Promise<TenantContext | NextResponse> {
  const tenantSlug = getTenantSlugFromRequest(request)
  const sessionUser = await getSessionUser()
  const dbUser = sessionUser ? await upsertUserFromSession(sessionUser) : null
  const isSuperAdmin = isSuperAdminEmail(dbUser?.email)

  let tenant: Tenant | null = null

  if (tenantSlug) {
    tenant = await getTenantBySlug(tenantSlug)
  } else if (dbUser) {
    const cookieStore = await cookies()
    const activeTenantId = cookieStore.get(ACTIVE_TENANT_COOKIE_NAME)?.value
    const memberships = await getMembershipsForUser(dbUser)
    const activeMembership =
      memberships.find(m => m.tenant_id === activeTenantId) ||
      memberships[0]

    if (activeMembership) {
      tenant = await getTenantById(activeMembership.tenant_id)
      await setActiveTenantCookie(activeMembership.tenant_id)
    }
  }

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  }

  if (options.public) {
    if (!tenant.is_active) {
      return NextResponse.json({ error: 'This store is temporarily closed', is_closed: true }, { status: 403 })
    }
    const role = dbUser ? await getUserTenantRole(dbUser.id, tenant.id) : null
    return { tenant, user: dbUser, role: isSuperAdmin ? 'owner' : role, sessionUser, isSuperAdmin }
  }

  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = isSuperAdmin ? 'owner' : await getUserTenantRole(dbUser.id, tenant.id)
  if (!role) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (options.roles && !options.roles.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return { tenant, user: dbUser, role, sessionUser, isSuperAdmin }
}

export function isTenantError(value: TenantContext | NextResponse): value is NextResponse {
  return value instanceof NextResponse
}
