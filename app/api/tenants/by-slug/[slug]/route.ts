import { NextResponse } from 'next/server'
import { getTenantBySlug } from '@/lib/tenancy'
import { getProxiedUrl } from '@/lib/images'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const tenant = await getTenantBySlug(slug)
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  }

  const { origin } = new URL(request.url)

  return NextResponse.json({
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    display_name: tenant.display_name,
    logo_url: tenant.logo_url ? getProxiedUrl(tenant.logo_url, origin) : tenant.logo_url,
    is_active: tenant.is_active,
  })
}
