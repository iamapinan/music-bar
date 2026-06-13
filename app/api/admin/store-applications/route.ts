import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'
import { isSuperAdminEmail, normalizeTenantSlug, upsertUserFromSession } from '@/lib/tenancy'

async function requireSuperAdmin() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return null
  const user = await upsertUserFromSession(sessionUser)
  return isSuperAdminEmail(user.email) ? user : null
}

async function getAvailableSlug(baseSlug: string) {
  const base = baseSlug || 'store'
  let candidate = base
  let suffix = 2

  while (true) {
    const rows = await sql`SELECT id FROM tenants WHERE slug = ${candidate} LIMIT 1`
    if (!rows[0]) return candidate
    candidate = `${base}-${suffix}`
    suffix += 1
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireSuperAdmin()
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const applications = status
      ? await sql`
          SELECT
            sa.*,
            t.slug as approved_tenant_slug,
            u.email as reviewed_by_email
          FROM store_applications sa
          LEFT JOIN tenants t ON t.id = sa.approved_tenant_id
          LEFT JOIN users u ON u.id = sa.reviewed_by_user_id
          WHERE sa.status = ${status}
          ORDER BY sa.created_at DESC
        `
      : await sql`
          SELECT
            sa.*,
            t.slug as approved_tenant_slug,
            u.email as reviewed_by_email
          FROM store_applications sa
          LEFT JOIN tenants t ON t.id = sa.approved_tenant_id
          LEFT JOIN users u ON u.id = sa.reviewed_by_user_id
          ORDER BY
            CASE sa.status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END,
            sa.created_at DESC
        `

    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error listing store applications:', error)
    return NextResponse.json({ error: 'Failed to list store applications' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireSuperAdmin()
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id, action, rejectionReason, slug } = await request.json()
    if (!id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Missing application id or action' }, { status: 400 })
    }

    const applications = await sql`
      SELECT * FROM store_applications
      WHERE id = ${id}
      LIMIT 1
    `
    const application = applications[0]
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }
    if (application.status !== 'pending') {
      return NextResponse.json({ error: 'Application already reviewed' }, { status: 409 })
    }

    if (action === 'reject') {
      const rejected = await sql`
        UPDATE store_applications
        SET status = 'rejected',
            reviewed_by_user_id = ${user.id},
            reviewed_at = NOW(),
            rejection_reason = ${typeof rejectionReason === 'string' ? rejectionReason.trim() || null : null},
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `
      return NextResponse.json(rejected[0])
    }

    const baseSlug = normalizeTenantSlug(typeof slug === 'string' && slug.trim() ? slug : (application.requested_slug || application.store_name))
    const tenantSlug = await getAvailableSlug(baseSlug)

    const result = await sql.begin(async tx => {
      const tenantRows = await tx`
        INSERT INTO tenants (slug, name, display_name, created_by_user_id)
        VALUES (${tenantSlug}, ${application.store_name}, ${application.store_name}, ${user.id})
        RETURNING *
      `
      const tenant = tenantRows[0]

      await tx`
        INSERT INTO app_settings (tenant_id, key, value, updated_at)
        VALUES
          (${tenant.id}, 'is_requests_enabled', 'true', NOW()),
          (${tenant.id}, 'active_playlist_ids', '[]', NOW())
        ON CONFLICT (tenant_id, key) DO NOTHING
      `

      await tx`
        INSERT INTO admin_grants (tenant_id, email, role, granted_by_user_id, updated_at)
        VALUES (${tenant.id}, ${application.applicant_email}, 'owner', ${user.id}, NOW())
        ON CONFLICT (tenant_id, lower(email)) DO UPDATE
        SET role = 'owner',
            granted_by_user_id = EXCLUDED.granted_by_user_id,
            updated_at = NOW()
      `

      const existingUsers = await tx`
        SELECT id FROM users
        WHERE lower(email) = lower(${application.applicant_email})
        LIMIT 1
      `
      if (existingUsers[0]) {
        await tx`
          INSERT INTO tenant_memberships (tenant_id, user_id, role)
          VALUES (${tenant.id}, ${existingUsers[0].id}, 'owner')
          ON CONFLICT (tenant_id, user_id) DO UPDATE
          SET role = 'owner'
        `
      }

      const approvedRows = await tx`
        UPDATE store_applications
        SET status = 'approved',
            approved_tenant_id = ${tenant.id},
            reviewed_by_user_id = ${user.id},
            reviewed_at = NOW(),
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `

      return { application: approvedRows[0], tenant }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error reviewing store application:', error)
    return NextResponse.json({ error: 'Failed to review store application' }, { status: 500 })
  }
}
