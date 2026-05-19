import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

function getJwtSecret() {
  const secret = process.env.NEXTAUTH_SECRET
  if (secret) return secret
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXTAUTH_SECRET is required in production')
  }
  return 'dev-only-fallback-secret'
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashed: string) {
  return bcrypt.compare(password, hashed)
}

export function signToken(payload: object) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, getJwtSecret())
  } catch {
    return null
  }
}
