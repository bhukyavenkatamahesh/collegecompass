import { LegalLayout, Section, P, UL } from '@/components/LegalPage'

export const metadata = {
  title: 'Privacy Policy — CollegeCompass',
  description: 'How CollegeCompass collects, uses and protects your data.',
}

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How we collect, use and protect your data"
      lastUpdated="May 2026"
    >
      <Section title="1. Who We Are">
        <P>
          CollegeCompass (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is an independent college
          prediction platform operated by CollegeDilado. Our service helps students predict their
          college admission chances based on official GATE, JEE Main, and JEE Advanced cutoff data.
          We are not affiliated with JoSAA, CSAB, IIT, NIT, CCMT, COAP, or any government body.
        </P>
        <P>
          For questions, contact us at{' '}
          <a href="mailto:support@collegecompass.in" style={{ color: '#2563eb' }}>
            support@collegecompass.in
          </a>
        </P>
      </Section>

      <Section title="2. Information We Collect">
        <P>We collect the following information when you use our service:</P>
        <UL
          items={[
            'Name and email address — when you register an account or unlock a report',
            'Phone number — optional, only if you provide it',
            'Exam details — score/rank, category, gender, home state (used solely for prediction)',
            'Payment information — processed entirely by Razorpay; we never store card/bank details',
            'Usage data — pages visited, device type, browser (for improving the service)',
            'IP address and approximate location — for security and fraud prevention',
          ]}
        />
      </Section>

      <Section title="3. How We Use Your Information">
        <P>We use your information only for:</P>
        <UL
          items={[
            'Generating and displaying your college prediction results',
            'Saving your predictions to your dashboard (if you have an account)',
            'Processing your ₹49 payment via Razorpay',
            'Sending you your unlocked report via email (if requested)',
            'Responding to your support queries',
            'Improving our prediction accuracy and service quality',
            'Complying with legal obligations',
          ]}
        />
        <P>
          We do not sell, rent, or share your personal data with third parties for marketing
          purposes.
        </P>
      </Section>

      <Section title="4. Payment Data">
        <P>
          All payments are processed securely by <strong>Razorpay</strong>. CollegeCompass does not
          store, log, or have access to your credit card, debit card, UPI, or bank account details.
          Payment processing is governed by Razorpay&apos;s Privacy Policy.
        </P>
      </Section>

      <Section title="5. Cookies">
        <P>
          We use essential cookies to keep you signed in and remember your session. We do not use
          third-party advertising or tracking cookies.
        </P>
      </Section>

      <Section title="6. Data Retention">
        <P>
          We retain your account data for as long as your account is active. Prediction results are
          stored to allow you to re-access them from your dashboard. You may request deletion of
          your account and data at any time by emailing{' '}
          <a href="mailto:support@collegecompass.in" style={{ color: '#2563eb' }}>
            support@collegecompass.in
          </a>
          .
        </P>
      </Section>

      <Section title="7. Data Security">
        <P>
          We use industry-standard HTTPS encryption for all data in transit. Passwords are hashed
          and never stored in plaintext. We take reasonable measures to protect your data from
          unauthorised access.
        </P>
      </Section>

      <Section title="8. Your Rights">
        <P>You have the right to:</P>
        <UL
          items={[
            'Access the personal data we hold about you',
            'Request correction of inaccurate data',
            'Request deletion of your data',
            'Withdraw consent for non-essential data processing',
          ]}
        />
        <P>
          To exercise any of these rights, email us at{' '}
          <a href="mailto:support@collegecompass.in" style={{ color: '#2563eb' }}>
            support@collegecompass.in
          </a>
          .
        </P>
      </Section>

      <Section title="9. Third-Party Services">
        <P>We use the following third-party services:</P>
        <UL
          items={[
            'Razorpay — payment processing',
            'Google OAuth — optional sign-in with Google',
            'Vercel — hosting and deployment',
            'Supabase/PostgreSQL — database',
          ]}
        />
        <P>Each service has its own privacy policy governing its data practices.</P>
      </Section>

      <Section title="10. Changes to This Policy">
        <P>
          We may update this Privacy Policy from time to time. Changes will be posted on this page
          with an updated date. Continued use of the service after changes constitutes acceptance of
          the updated policy.
        </P>
      </Section>

      <Section title="11. Contact">
        <P>
          For any privacy concerns, write to us at{' '}
          <a href="mailto:support@collegecompass.in" style={{ color: '#2563eb' }}>
            support@collegecompass.in
          </a>
          .
        </P>
      </Section>
    </LegalLayout>
  )
}
