import { createHash, timingSafeEqual } from 'crypto'
import type { TenantRole } from '@/lib/tenancy'

export type ApiKeyScope = 'playlist:switch' | 'settings:write' | 'requests:manage' | '*'

export type ApiKeyPrincipal = {
  name: string
  role: TenantRole
  scopes: ApiKeyScope[]
}

type ApiKeyConfig = {
  name?: string
  key?: string
  keyHash?: string
  tenant?: string
  tenantSlug?: string
  tenants?: string[]
  role?: TenantRole
  scopes?: ApiKeyScope[]
}

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

function getPresentedKey(request: Request) {
  const explicit = request.headers.get('x-api-key')
  if (explicit) return explicit.trim()

  const authorization = request.headers.get('authorization')
  const match = authorization?.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || null
}

function parseApiKeys() {
  const raw = process.env.MUSIC_BAR_API_KEYS
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed as ApiKeyConfig[] : []
  } catch {
    return raw
      .split(',')
      .map(key => key.trim())
      .filter(Boolean)
      .map((key, index) => ({
        name: `api-key-${index + 1}`,
        key,
        tenant: '*',
        role: 'admin' as TenantRole,
        scopes: ['*' as ApiKeyScope],
      }))
  }
}

function keyMatches(config: ApiKeyConfig, presentedKey: string) {
  if (config.key && safeEqual(config.key, presentedKey)) return true

  const configuredHash = config.keyHash?.replace(/^sha256:/, '')
  return !!configuredHash && safeEqual(configuredHash, sha256(presentedKey))
}

function tenantMatches(config: ApiKeyConfig, tenantSlug: string) {
  const tenants = [
    config.tenant,
    config.tenantSlug,
    ...(config.tenants || []),
  ].filter(Boolean)

  return tenants.includes('*') || tenants.includes(tenantSlug)
}

function hasScopes(config: ApiKeyConfig, requiredScopes: string[]) {
  const scopes = config.scopes || []
  return scopes.includes('*') || requiredScopes.every(scope => scopes.includes(scope as ApiKeyScope))
}

export function authenticateApiKey(
  request: Request,
  tenantSlug: string,
  requiredScopes: string[] = [],
): ApiKeyPrincipal | null {
  const presentedKey = getPresentedKey(request)
  if (!presentedKey) return null

  for (const config of parseApiKeys()) {
    if (!keyMatches(config, presentedKey)) continue
    if (!tenantMatches(config, tenantSlug)) continue
    if (!hasScopes(config, requiredScopes)) continue

    return {
      name: config.name || 'api-key',
      role: config.role || 'admin',
      scopes: config.scopes || [],
    }
  }

  return null
}
