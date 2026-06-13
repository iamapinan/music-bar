import { NextResponse } from 'next/server'
import { getTenantBySlug } from '@/lib/tenancy'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const tenant = await getTenantBySlug(slug)
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    display_name: tenant.display_name,
    logo_url: tenant.logo_url,
    is_active: tenant.is_active,
  })
}
