import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 })
    }
    if (name.trim().length < 2 || !/^[a-zA-Z\s'-]+$/.test(name.trim())) {
      return NextResponse.json(
        { error: 'Enter a valid name (letters only, min 2 characters)' },
        { status: 400 }
      )
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check for existing account
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Try signing in.' },
        { status: 409 }
      )
    }

    // Hash password and create user + credentials account in one transaction
    const hash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        accounts: {
          create: {
            type: 'credentials',
            provider: 'credentials',
            providerAccountId: normalizedEmail,
            access_token: hash, // hashed password stored in access_token
          },
        },
      },
      select: { id: true, email: true, name: true },
    })

    return NextResponse.json({ success: true, userId: user.id })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }
}
