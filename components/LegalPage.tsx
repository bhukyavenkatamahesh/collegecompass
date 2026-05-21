import Link from 'next/link'

export function LegalLayout({
  title,
  subtitle,
  lastUpdated,
  children,
}: {
  title: string
  subtitle: string
  lastUpdated: string
  children: React.ReactNode
}) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter,sans-serif' }}>
      {/* Navbar */}
      <nav
        style={{
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '0 1.5rem',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            fontSize: '1.1rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
          }}
        >
          <span style={{ color: '#0f172a' }}>college</span>
          <span style={{ color: '#2563eb' }}>compass</span>
          <span style={{ color: '#2563eb' }}>.</span>
        </Link>
        <Link
          href="/predict"
          style={{
            background: '#2563eb',
            color: '#fff',
            padding: '0.45rem 1.1rem',
            borderRadius: 99,
            fontSize: '0.82rem',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Get Prediction →
        </Link>
      </nav>

      {/* Header */}
      <div
        style={{
          background: '#0f172a',
          padding: '3rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            color: '#3b82f6',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '0.6rem',
          }}
        >
          Legal
        </p>
        <h1
          style={{
            color: '#f1f5f9',
            fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: '0 0 0.5rem',
          }}
        >
          {title}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
          {subtitle} &nbsp;·&nbsp; Last updated: {lastUpdated}
        </p>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: '3rem 1.5rem 5rem',
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            padding: 'clamp(1.5rem, 5vw, 3rem)',
            lineHeight: 1.75,
            color: '#334155',
            fontSize: '0.95rem',
          }}
        >
          {children}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          background: '#0f172a',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          borderTop: '1px solid #1e293b',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '1rem',
          }}
        >
          {[
            { l: 'Privacy Policy', h: '/privacy' },
            { l: 'Terms & Conditions', h: '/terms' },
            { l: 'Refund Policy', h: '/refund' },
            { l: 'Contact Us', h: '/contact' },
            { l: 'Pricing', h: '/pricing' },
          ].map(x => (
            <Link
              key={x.l}
              href={x.h}
              style={{ color: '#64748b', fontSize: '0.8rem', textDecoration: 'none' }}
            >
              {x.l}
            </Link>
          ))}
        </div>
        <p style={{ color: '#475569', fontSize: '0.78rem' }}>
          © {new Date().getFullYear()} CollegeCompass. Independent predictions using official cutoff
          data.
        </p>
      </div>
    </div>
  )
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '2.2rem' }}>
      <h2
        style={{
          color: '#0f172a',
          fontSize: '1.1rem',
          fontWeight: 700,
          marginBottom: '0.6rem',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '0.4rem',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

export function P({ children }: { children: React.ReactNode }) {
  return <p style={{ marginBottom: '0.75rem', color: '#475569' }}>{children}</p>
}

export function UL({ items }: { items: string[] }) {
  return (
    <ul style={{ paddingLeft: '1.2rem', marginBottom: '0.75rem', color: '#475569' }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: '0.3rem' }}>
          {item}
        </li>
      ))}
    </ul>
  )
}
