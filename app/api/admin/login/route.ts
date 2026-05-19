import { NextRequest, NextResponse } from 'next/server'
import { signToken, verifyToken } from '@/lib/auth'

function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  const admin = token ? verifyToken(token) : null
  return NextResponse.json({ authenticated: Boolean(admin) })
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  // Simple env-based auth for MVP — upgrade to DB in production
  if (email !== adminEmail || password !== adminPassword) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = signToken({ email, role: 'admin' })

  const res = NextResponse.json({ success: true })
  res.cookies.set('admin_token', token, adminCookieOptions())
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.set('admin_token', '', {
    ...adminCookieOptions(),
    maxAge: 0,
  })
  return res
}
