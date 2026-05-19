import { describe, it, expect } from 'vitest'
import { signToken, verifyToken, hashPassword, verifyPassword } from '@/lib/auth'

const mutableEnv = process.env as Record<string, string | undefined>

// ─────────────────────────────────────────────────────────────────────────────
// JWT sign / verify
// ─────────────────────────────────────────────────────────────────────────────
describe('signToken / verifyToken', () => {
  it('creates and verifies a valid token', () => {
    const token = signToken({ email: 'admin@test.com', role: 'admin' })
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)

    const decoded = verifyToken(token)
    expect(decoded).toBeTruthy()
    expect((decoded as { email: string }).email).toBe('admin@test.com')
    expect((decoded as { role: string }).role).toBe('admin')
  })

  it('returns null for invalid token', () => {
    expect(verifyToken('invalid-jwt-string')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(verifyToken('')).toBeNull()
  })

  it('returns null for tampered token', () => {
    const token = signToken({ test: true })
    const tampered = token.slice(0, -5) + 'XXXXX'
    expect(verifyToken(tampered)).toBeNull()
  })

  it('includes iat and exp claims', () => {
    const token = signToken({ role: 'test' })
    const decoded = verifyToken(token) as { iat: number; exp: number }
    expect(decoded.iat).toBeTypeOf('number')
    expect(decoded.exp).toBeTypeOf('number')
    expect(decoded.exp).toBeGreaterThan(decoded.iat)
  })

  it('token expires in 7 days', () => {
    const token = signToken({ role: 'test' })
    const decoded = verifyToken(token) as { iat: number; exp: number }
    const diff = decoded.exp - decoded.iat
    expect(diff).toBe(7 * 24 * 60 * 60) // 7 days in seconds
  })

  it('does not sign production tokens without NEXTAUTH_SECRET', () => {
    const originalNodeEnv = process.env.NODE_ENV
    const originalSecret = process.env.NEXTAUTH_SECRET
    try {
      mutableEnv.NODE_ENV = 'production'
      delete process.env.NEXTAUTH_SECRET

      expect(() => signToken({ role: 'test' })).toThrow('NEXTAUTH_SECRET is required')
    } finally {
      if (originalNodeEnv === undefined) delete mutableEnv.NODE_ENV
      else mutableEnv.NODE_ENV = originalNodeEnv
      if (originalSecret === undefined) delete process.env.NEXTAUTH_SECRET
      else process.env.NEXTAUTH_SECRET = originalSecret
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Password hashing
// ─────────────────────────────────────────────────────────────────────────────
describe('hashPassword / verifyPassword', () => {
  it('hashes a password and verifies it correctly', async () => {
    const hash = await hashPassword('test123')
    expect(typeof hash).toBe('string')
    expect(hash).not.toBe('test123')
    expect(hash.startsWith('$2')).toBe(true) // bcrypt prefix

    const valid = await verifyPassword('test123', hash)
    expect(valid).toBe(true)
  })

  it('rejects wrong password', async () => {
    const hash = await hashPassword('correct-password')
    const valid = await verifyPassword('wrong-password', hash)
    expect(valid).toBe(false)
  })

  it('produces different hashes for same input (salted)', async () => {
    const h1 = await hashPassword('same')
    const h2 = await hashPassword('same')
    expect(h1).not.toBe(h2)
    // But both should verify
    expect(await verifyPassword('same', h1)).toBe(true)
    expect(await verifyPassword('same', h2)).toBe(true)
  })
})
