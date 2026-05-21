'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
)

function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const callbackUrl = params.get('callbackUrl') || '/dashboard'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogle() {
    setLoading(true)
    await signIn('google', { callbackUrl })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim() || !password) {
      setError('All fields are required')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
    })
    const data = (await res.json()) as { success?: boolean; error?: string }
    setLoading(false)
    if (!res.ok || !data.success) {
      setError(data.error || 'Registration failed. Please try again.')
      return
    }
    router.push('/auth/login?registered=1')
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    display: 'block',
    marginBottom: '0.3rem',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      {/* Logo */}
      <Link href="/" className="nav-logo" style={{ marginBottom: '2rem', fontSize: '1.4rem' }}>
        college<span style={{ color: '#2563eb' }}>compass</span>
        <span style={{ color: '#2563eb' }}>.</span>
      </Link>

      <div
        className="glass"
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 'var(--r-lg)',
          padding: '2rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.3rem' }}>
          Create account
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
          Save your predictions and access them anytime
        </p>

        {/* Google OAuth */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            padding: '0.72rem 1rem',
            borderRadius: 'var(--r-sm)',
            border: '1.5px solid var(--border-strong)',
            background: 'var(--bg-1)',
            cursor: 'pointer',
            fontFamily: 'Satoshi,Inter,sans-serif',
            fontWeight: 600,
            fontSize: '0.9rem',
            marginBottom: '1.2rem',
            transition: 'border-color .15s, background .15s',
            color: 'var(--text)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--text)'
            e.currentTarget.style.background = 'var(--bg-muted)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-strong)'
            e.currentTarget.style.background = 'var(--bg-1)'
          }}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Divider */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}
        >
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', userSelect: 'none' }}>
            or register with email
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}
        >
          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              className="input-field"
              type="text"
              placeholder="Arjun Kumar"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              className="input-field"
              type="email"
              placeholder="arjun@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <div>
            <label style={labelStyle}>Confirm Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="Repeat password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(220,38,38,0.08)',
                border: '1px solid rgba(220,38,38,0.22)',
                borderRadius: 'var(--r-sm)',
                padding: '0.6rem 0.9rem',
                color: '#dc2626',
                fontSize: '0.83rem',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: '0.8rem',
              borderRadius: 'var(--r-sm)',
              width: '100%',
              marginTop: '0.2rem',
            }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        {/* Benefits — use bg-muted so it's visible inside the white card */}
        <div
          style={{
            background: 'var(--bg-muted)',
            borderRadius: 'var(--r-sm)',
            padding: '0.9rem 1.1rem',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          {[
            { icon: '💾', text: 'Save unlimited predictions' },
            { icon: '🔓', text: 'Re-open any past paid report' },
            { icon: '📱', text: 'Access from any device' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1rem' }}>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        <p
          style={{
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginTop: '1.2rem',
          }}
        >
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg)',
          }}
        >
          Loading…
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
