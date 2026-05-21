'use client'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export function NavAuth({ dark = false }: { dark?: boolean }) {
  const { data: session, status } = useSession()

  const mutedColor = dark ? '#94a3b8' : 'var(--text-muted)'
  const textColor = dark ? '#f1f5f9' : 'var(--text)'
  const borderColor = dark ? 'rgba(148,163,184,0.2)' : 'var(--border-strong)'

  if (status === 'loading') {
    return (
      <div
        className="animate-pulse"
        style={{
          width: 64,
          height: 28,
          borderRadius: 'var(--r-sm)',
          background: dark ? 'rgba(255,255,255,0.08)' : 'var(--bg-muted)',
        }}
      />
    )
  }

  if (session?.user) {
    const user = session.user
    const initials = (user.name ?? user.email ?? '?')[0].toUpperCase()

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {/* Avatar + name → links to dashboard */}
        <Link
          href="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            textDecoration: 'none',
            borderRadius: 'var(--r-sm)',
            padding: '0.2rem 0.45rem 0.2rem 0.2rem',
            transition: 'background .15s',
            background: 'transparent',
          }}
          onMouseEnter={e =>
            (e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.07)' : 'var(--bg-muted)')
          }
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {user.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={user.image}
              alt=""
              width={26}
              height={26}
              style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'var(--brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.72rem',
                fontFamily: 'Satoshi,Inter,sans-serif',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
          )}
          <span
            className="hide-xs"
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              fontFamily: 'Satoshi,Inter,sans-serif',
              color: textColor,
              maxWidth: 88,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user.name?.split(' ')[0] ?? user.email?.split('@')[0]}
          </span>
        </Link>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="btn btn-sm"
          style={{
            fontSize: '0.76rem',
            color: mutedColor,
            background: 'transparent',
            border: `1px solid ${borderColor}`,
            borderRadius: 'var(--r-sm)',
            padding: '0.28rem 0.55rem',
            fontFamily: 'Satoshi,Inter,sans-serif',
            fontWeight: 500,
          }}
        >
          Sign out
        </button>
      </div>
    )
  }

  // Logged out
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
      <Link
        href="/auth/login"
        className="btn btn-sm hide-xs"
        style={{
          fontSize: '0.82rem',
          color: mutedColor,
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          fontFamily: 'Satoshi,Inter,sans-serif',
          fontWeight: 500,
          padding: '0.3rem 0.5rem',
        }}
      >
        Sign in
      </Link>
      <Link
        href="/auth/register"
        className="btn btn-sm"
        style={{
          fontSize: '0.8rem',
          color: dark ? '#0f172a' : '#fff',
          background: dark ? '#ffffff' : 'var(--brand)',
          border: 'none',
          boxShadow: dark ? 'none' : '0 2px 8px -2px rgba(37,99,235,0.4)',
          whiteSpace: 'nowrap',
        }}
      >
        Register free
      </Link>
    </div>
  )
}
