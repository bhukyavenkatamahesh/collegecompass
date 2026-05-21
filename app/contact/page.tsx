import { LegalLayout, Section, P } from '@/components/LegalPage'

export const metadata = {
  title: 'Contact Us — CollegeCompass',
  description: 'Get in touch with the CollegeCompass support team.',
}

export default function ContactPage() {
  return (
    <LegalLayout title="Contact Us" subtitle="We're here to help" lastUpdated="May 2026">
      <Section title="Support Email">
        <P>
          For all queries — payment issues, prediction questions, account help, refunds, or anything
          else — email us at:
        </P>
        <div
          style={{
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '1rem 1.4rem',
            margin: '0.5rem 0 1.2rem',
            display: 'inline-block',
          }}
        >
          <a
            href="mailto:support@collegecompass.in"
            style={{
              color: '#2563eb',
              fontWeight: 700,
              fontSize: '1.05rem',
              textDecoration: 'none',
            }}
          >
            support@collegecompass.in
          </a>
        </div>
        <P>
          We typically respond within <strong>24 hours</strong> on weekdays.
        </P>
      </Section>

      <Section title="What to Include in Your Email">
        <P>To help us respond faster, please mention:</P>
        <ul style={{ paddingLeft: '1.2rem', color: '#475569' }}>
          <li style={{ marginBottom: '0.3rem' }}>Your registered email address</li>
          <li style={{ marginBottom: '0.3rem' }}>
            Razorpay Payment ID (if your query is about a payment) — found in your bank statement or
            Razorpay email
          </li>
          <li style={{ marginBottom: '0.3rem' }}>A brief description of your issue or question</li>
        </ul>
      </Section>

      <Section title="Common Queries">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          {[
            {
              q: "My payment was deducted but the report didn't unlock",
              a: "Email us with your Payment ID. We'll verify and fix it within a few hours.",
            },
            {
              q: 'I entered the wrong rank/score',
              a: "Go back to the predict page and re-submit with the correct details. Your previous attempt won't affect anything.",
            },
            {
              q: 'I want a refund',
              a: "See our Refund Policy. Email us with your Payment ID and we'll review it.",
            },
            {
              q: "I can't access my saved report",
              a: "Make sure you're signed in with the same account you used when unlocking. Email us if the issue persists.",
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
      </Section>

      <Section title="About CollegeCompass">
        <P>
          CollegeCompass is an independent platform operated by <strong>CollegeDilado</strong>. We
          are not affiliated with JoSAA, CSAB, IIT, NIT, CCMT, COAP, or any government authority.
          Our predictions are based on publicly available official cutoff data.
        </P>
      </Section>
    </LegalLayout>
  )
}
