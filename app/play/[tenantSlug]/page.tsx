import { redirect } from 'next/navigation'

export default async function TenantPlayerPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params
  redirect(`/play/${tenantSlug}/request`)
}
