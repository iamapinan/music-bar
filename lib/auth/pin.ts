import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'crypto'

const PIN_HASH_PREFIX = 'scrypt'
const KEY_LENGTH = 32

export function normalizePinEmail(email: unknown) {
  return typeof email === 'string' ? email.trim().toLowerCase() : ''
}

export function isValidPin(pin: unknown) {
  return typeof pin === 'string' && /^\d{4,8}$/.test(pin)
}

export function createPinHash(pin: string) {
  const salt = randomBytes(16).toString('base64url')
  const key = scryptSync(pin, salt, KEY_LENGTH).toString('base64url')
  return `${PIN_HASH_PREFIX}:${salt}:${key}`
}

export function verifyPin(pin: string, storedHash: unknown) {
  if (typeof storedHash !== 'string') return false
  const [prefix, salt, key] = storedHash.split(':')
  if (prefix !== PIN_HASH_PREFIX || !salt || !key) return false

  try {
    const expected = Buffer.from(key, 'base64url')
    const actual = scryptSync(pin, salt, expected.length)
    if (expected.length !== actual.length) return false
    return timingSafeEqual(expected, actual)
  } catch {
    return false
  }
}

export function syntheticPinUid(email: string) {
  const digest = createHash('sha256').update(email).digest('hex').slice(0, 48)
  return `pin:${digest}`
}
