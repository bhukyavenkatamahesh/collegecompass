import Link from 'next/link'
import { LegalLayout } from '@/components/LegalPage'

export const metadata = {
  title: 'Pricing — CollegeCompass',
  description: 'CollegeCompass is free to try. Unlock your full ranked prediction report for ₹49.',
}

const FREE_FEATURES = [
  'Top 3 college predictions (preview)',
  'Supports GATE, JEE Main, JEE Advanced',
  'Category, quota & gender-aware matching',
  'All exam years available',
  'No account required for preview',
]

const PAID_FEATURES = [
  'Full ranked list — all matching colleges',
  'Branch-level cutoffs with opening & closing ranks',
  'Round-wise breakdown (R1 → R6)',
  'Filter by college type, branch, state',
  'Downloadable / saveable report',
  'Access from dashboard anytime',
  'Covers IITs, NITs, IIITs, GFTIs, IISERs',
  'One-time payment — no subscription',
]

export default function PricingPage() {
  return (
    <LegalLayout
      title="Pricing"
      subtitle="Simple, one-time pricing — no subscription"
      lastUpdated="May 2026"
    >
      {/* Intro */}
      <p style={{ color: '#475569', marginBottom: '2rem', fontSize: '0.97rem', lineHeight: 1.75 }}>
        CollegeCompass is free to try. Enter your rank or score and instantly see your top 3
        predicted colleges at no cost. When you&apos;re ready for the full picture — every matching
        college, every branch, every round — unlock your complete report for a one-time fee of{' '}
        <strong style={{ color: '#0f172a' }}>₹49</strong>.
      </p>

      {/* Plan cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.2rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Free plan */}
        <div
          style={{
            border: '1.5px solid #e2e8f0',
            borderRadius: 16,
            padding: '1.6rem',
            background: '#f8fafc',
          }}
        >
          <p
            style={{
              color: '#64748b',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.4rem',
            }}
          >
            Free
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.25rem',
              marginBottom: '0.3rem',
            }}
          >
            <span
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.04em',
              }}
            >
              ₹0
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '1.4rem' }}>
            Always free — no card required
          </p>

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 1.6rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.55rem',
            }}
          >
            {FREE_FEATURES.map(f => (
              <li
                key={f}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.55rem',
                  fontSize: '0.88rem',
                  color: '#475569',
                }}
              >
                <span style={{ color: '#22c55e', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>

          <Link
            href="/predict"
            style={{
              display: 'block',
              textAlign: 'center',
              border: '1.5px solid #cbd5e1',
              borderRadius: 10,
              padding: '0.6rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#475569',
              textDecoration: 'none',
            }}
          >
            Try Free →
          </Link>
        </div>

        {/* Paid plan */}
        <div
          style={{
            border: '2px solid #2563eb',
            borderRadius: 16,
            padding: '1.6rem',
            background: '#fff',
            position: 'relative',
            boxShadow: '0 4px 24px rgba(37,99,235,0.10)',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '-13px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#2563eb',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              padding: '0.22rem 0.8rem',
              borderRadius: 99,
              textTransform: 'uppercase',
            }}
          >
            Most Popular
          </span>

          <p
            style={{
              color: '#2563eb',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.4rem',
            }}
          >
            Full Report
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.25rem',
              marginBottom: '0.3rem',
            }}
          >
            <span
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.04em',
              }}
            >
              ₹49
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>one-time</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '1.4rem' }}>
            Pay once, access forever
          </p>

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 1.6rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.55rem',
            }}
          >
            {PAID_FEATURES.map(f => (
              <li
                key={f}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.55rem',
                  fontSize: '0.88rem',
                  color: '#475569',
                }}
              >
                <span style={{ color: '#2563eb', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>

          <Link
            href="/predict"
            style={{
              display: 'block',
              textAlign: 'center',
              background: '#2563eb',
              borderRadius: 10,
              padding: '0.65rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#fff',
              textDecoration: 'none',
            }}
          >
            Get Full Report →
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <section style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            color: '#0f172a',
            fontSize: '1.05rem',
            fontWeight: 700,
            marginBottom: '1rem',
            borderBottom: '2px solid #e2e8f0',
            paddingBottom: '0.4rem',
          }}
        >
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {[
            {
              q: 'What payment methods are accepted?',
              a: 'We accept UPI (GPay, PhonePe, Paytm), debit cards, credit cards, and net banking via Razorpay.',
            },
            {
              q: 'Is the ₹49 a subscription?',
              a: 'No. It is a one-time charge for your current prediction report. There are no recurring charges.',
            },
            {
              q: 'Can I access the report later?',
              a: 'Yes. Sign in with the same account you used when unlocking and your report will be in your dashboard.',
            },
            {
              q: 'What if my payment fails but money is deducted?',
              a: 'Email us at support@collegecompass.in with your Razorpay Payment ID. We verify and fix it within a few hours.',
            },
            {
              q: 'Do you offer refunds?',
              a: 'Yes — for payment failures or technical errors on our side. See our Refund Policy for full details.',
            },
          ].map(({ q, a }) => (
            <div
              key={q}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '1rem 1.2rem',
              }}
            >
              <p
                style={{
                  fontWeight: 600,
                  color: '#0f172a',
                  marginBottom: '0.3rem',
                  fontSize: '0.92rem',
                }}
              >
                {q}
              </p>
              <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Links */}
      <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center' }}>
        Questions?{' '}
        <a href="mailto:support@collegecompass.in" style={{ color: '#2563eb' }}>
          support@collegecompass.in
        </a>{' '}
        ·{' '}
        <Link href="/refund" style={{ color: '#2563eb' }}>
          Refund Policy
        </Link>{' '}
        ·{' '}
        <Link href="/terms" style={{ color: '#2563eb' }}>
          Terms & Conditions
        </Link>
      </p>
    </LegalLayout>
  )
}
