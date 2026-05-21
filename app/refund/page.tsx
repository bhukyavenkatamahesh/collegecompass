import { LegalLayout, Section, P, UL } from '@/components/LegalPage'

export const metadata = {
  title: 'Refund Policy — CollegeCompass',
  description: 'Refund and cancellation policy for CollegeCompass ₹49 report.',
}

export default function RefundPage() {
  return (
    <LegalLayout
      title="Refund Policy"
      subtitle="Our policy for the ₹49 prediction report"
      lastUpdated="May 2026"
    >
      <Section title="1. Overview">
        <P>
          CollegeCompass provides a one-time digital prediction report for <strong>₹49</strong>.
          Because the report is generated and delivered instantly upon payment, we generally do not
          offer refunds for change of mind.
        </P>
        <P>
          However, we believe in fairness. If the issue is on our end — a payment failure, technical
          error, or duplicate charge — we will process a full refund promptly.
        </P>
      </Section>

      <Section title="2. When You Are Eligible for a Refund">
        <P>You are eligible for a full refund if:</P>
        <UL
          items={[
            'Your payment was deducted but the report was not unlocked or delivered due to a technical error on our side',
            'You were charged more than once for the same report (duplicate charge)',
            'The payment gateway (Razorpay) failed mid-transaction and your account was debited but no order was created on our system',
            'You experienced a critical technical bug that prevented you from viewing or downloading the report, and our support team was unable to resolve it',
          ]}
        />
      </Section>

      <Section title="3. When Refunds Are Not Applicable">
        <P>Refunds will not be issued for:</P>
        <UL
          items={[
            'Change of mind after the report has been successfully delivered',
            'Incorrect rank, score, or category entered by the user',
            'Dissatisfaction with prediction results (predictions are based on historical cutoffs and are for guidance only)',
            'Slow internet connection or device issues on the user&apos;s end',
            'After 7 days from the date of purchase',
          ]}
        />
      </Section>

      <Section title="4. How to Request a Refund">
        <P>To request a refund, email us at:</P>
        <P>
          <a href="mailto:support@collegecompass.in" style={{ color: '#2563eb', fontWeight: 600 }}>
            support@collegecompass.in
          </a>
        </P>
        <P>Please include in your email:</P>
        <UL
          items={[
            'Your registered email address',
            'Razorpay Payment ID (found in your payment confirmation email or bank statement)',
            'Date of payment',
            'Brief description of the issue',
          ]}
        />
      </Section>

      <Section title="5. Refund Processing Time">
        <P>
          Once your refund request is approved, we will initiate the refund within{' '}
          <strong>3–5 business days</strong>. The amount will be credited back to your original
          payment method (bank account, UPI, card) depending on your bank&apos;s processing time —
          typically 5–7 business days.
        </P>
      </Section>

      <Section title="6. Cancellations">
        <P>
          There are no recurring subscriptions on CollegeCompass. The ₹49 charge is a one-time
          payment. There is nothing to cancel.
        </P>
      </Section>

      <Section title="7. Contact">
        <P>
          For refund queries, write to{' '}
          <a href="mailto:support@collegecompass.in" style={{ color: '#2563eb' }}>
            support@collegecompass.in
          </a>
          . We aim to respond within 24 hours on business days.
        </P>
      </Section>
    </LegalLayout>
  )
}
