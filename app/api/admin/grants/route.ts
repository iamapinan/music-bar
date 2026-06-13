import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'
import { isSuperAdminEmail, upsertUserFromSession } from '@/lib/tenancy'

async function requireSuperAdmin() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return null
  const user = await upsertUserFromSession(sessionUser)
  return isSuperAdminEmail(user.email) ? user : null
}

export async function GET() {
  try {
    const user = await requireSuperAdmin()
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const grants = await sql`
      SELECT
        ag.*,
        t.name as tenant_name,
        t.slug as tenant_slug,
        u.id as user_id,
        u.name as user_name,
        u.photo_url as user_photo_url
      FROM admin_grants ag
      JOIN tenants t ON t.id = ag.tenant_id
      LEFT JOIN users u ON lower(u.email) = lower(ag.email)
      ORDER BY ag.created_at DESC
    `

    return NextResponse.json(grants)
  } catch (error) {
    console.error('Error listing admin grants:', error)
    return NextResponse.json({ error: 'Failed to list admin grants' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSuperAdmin()
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { email, tenantId, role } = await request.json()
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
    const selectedRole = ['owner', 'admin', 'staff'].includes(role) ? role : 'admin'

    if (!normalizedEmail || !tenantId) {
      return NextResponse.json({ error: 'Missing email or tenantId' }, { status: 400 })
    }

    const grant = await sql`
      INSERT INTO admin_grants (tenant_id, email, role, granted_by_user_id, updated_at)
      VALUES (${tenantId}, ${normalizedEmail}, ${selectedRole}, ${user.id}, NOW())
      ON CONFLICT (tenant_id, lower(email)) DO UPDATE
      SET role = EXCLUDED.role,
          granted_by_user_id = EXCLUDED.granted_by_user_id,
          updated_at = NOW()
      RETURNING *
    `

    const existingUsers = await sql`
      SELECT id FROM users WHERE lower(email) = lower(${normalizedEmail}) LIMIT 1
    `
    if (existingUsers[0]) {
      await sql`
        INSERT INTO tenant_memberships (tenant_id, user_id, role)
        VALUES (${tenantId}, ${existingUsers[0].id}, ${selectedRole})
        ON CONFLICT (tenant_id, user_id) DO UPDATE
        SET role = EXCLUDED.role
      `
    }

    return NextResponse.json(grant[0])
  } catch (error) {
    console.error('Error creating admin grant:', error)
    return NextResponse.json({ error: 'Failed to create admin grant' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireSuperAdmin()
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'Missing grant id' }, { status: 400 })

    const grants = await sql`
      DELETE FROM admin_grants
      WHERE id = ${id}
      RETURNING tenant_id, email
    `

    if (grants[0]) {
      await sql`
        DELETE FROM tenant_memberships tm
        USING users u
        WHERE tm.user_id = u.id
          AND tm.tenant_id = ${grants[0].tenant_id}
          AND lower(u.email) = lower(${grants[0].email})
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting admin grant:', error)
    return NextResponse.json({ error: 'Failed to delete admin grant' }, { status: 500 })
  }
}
