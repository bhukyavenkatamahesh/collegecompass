import type { NextAuthConfig } from 'next-auth'

// Edge-safe config (no Prisma/DB imports) — used by middleware
export const authConfig = {
  pages: { signIn: '/auth/login' },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isProtected =
        nextUrl.pathname.startsWith('/predict') || nextUrl.pathname.startsWith('/results')
      if (isProtected && !isLoggedIn) return false
      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
