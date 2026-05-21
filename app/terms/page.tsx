import { LegalLayout, Section, P, UL } from '@/components/LegalPage'

export const metadata = {
  title: 'Terms & Conditions — CollegeCompass',
  description: 'Terms and conditions for using CollegeCompass.',
}

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      subtitle="Rules governing your use of CollegeCompass"
      lastUpdated="May 2026"
    >
      <Section title="1. Acceptance of Terms">
        <P>
          By accessing or using CollegeCompass (&quot;Service&quot;), you agree to be bound by these
          Terms &amp; Conditions. If you do not agree, please do not use the Service. These terms
          apply to all users, whether or not you create an account or make a payment.
        </P>
      </Section>

      <Section title="2. About the Service">
        <P>
          CollegeCompass is an independent prediction tool that helps students estimate their
          college admission chances based on official cutoff data from JoSAA, CSAB, COAP, and CCMT.
          We are <strong>not affiliated</strong> with any of these bodies, IITs, NITs, IIITs, or any
          government authority.
        </P>
        <P>
          <strong>Predictions are for guidance only.</strong> Actual admission outcomes depend on
          factors outside our control including changes in cutoffs, seat availability, document
          verification, and counselling round outcomes. We make no guarantees of admission.
        </P>
      </Section>

      <Section title="3. Eligibility">
        <P>
          You must be at least 13 years old to use this Service. If you are under 18, you confirm
          that your parent or guardian has reviewed and agreed to these terms.
        </P>
      </Section>

      <Section title="4. User Accounts">
        <UL
          items={[
            'You are responsible for keeping your account credentials secure',
            'You must provide accurate information when registering',
            'One account per user — creating duplicate accounts is not allowed',
            'We reserve the right to suspend accounts that violate these terms',
          ]}
        />
      </Section>

      <Section title="5. Payments and Access">
        <P>
          A one-time fee of <strong>₹49</strong> unlocks your complete ranked prediction report.
          This is a digital product delivered instantly. The fee is non-refundable except as stated
          in our{' '}
          <a href="/refund" style={{ color: '#2563eb' }}>
            Refund Policy
          </a>
          .
        </P>
        <P>
          All payments are processed by Razorpay. By making a payment, you also agree to
          Razorpay&apos;s Terms of Service.
        </P>
      </Section>

      <Section title="6. Acceptable Use">
        <P>You agree not to:</P>
        <UL
          items={[
            'Use the Service for any unlawful purpose',
            'Scrape, copy, or redistribute our prediction data or cutoff database',
            'Attempt to reverse-engineer or access our backend systems',
            'Share or resell prediction reports commercially',
            'Upload harmful, misleading, or offensive content',
            'Use automated bots or scripts to access the Service',
          ]}
        />
      </Section>

      <Section title="7. Intellectual Property">
        <P>
          All content on CollegeCompass — including the codebase, UI design, brand, and compiled
          cutoff data — is owned by CollegeDilado. You may not reproduce or distribute any part of
          the Service without written permission.
        </P>
        <P>
          Cutoff data is sourced from public government portals (JoSAA, CSAB, CCMT, COAP) and is
          used under fair use for educational purposes.
        </P>
      </Section>

      <Section title="8. Disclaimer of Warranties">
        <P>
          The Service is provided &quot;as is&quot; without any warranty, express or implied. We do
          not warrant that predictions will be accurate, complete, or result in actual admission. We
          are not liable for any decisions made based on our predictions.
        </P>
      </Section>

      <Section title="9. Limitation of Liability">
        <P>
          To the maximum extent permitted by law, CollegeDilado shall not be liable for any direct,
          indirect, incidental, or consequential damages arising from your use of the Service. Our
          total liability shall not exceed the amount you paid us (₹49).
        </P>
      </Section>

      <Section title="10. Governing Law">
        <P>
          These terms are governed by the laws of India. Any disputes shall be subject to the
          exclusive jurisdiction of courts in India.
        </P>
      </Section>

      <Section title="11. Changes to Terms">
        <P>
          We may revise these terms at any time. Continued use of the Service after changes are
          posted constitutes your acceptance of the new terms.
        </P>
      </Section>

      <Section title="12. Contact">
        <P>
          For any queries about these terms, write to{' '}
          <a href="mailto:support@collegecompass.in" style={{ color: '#2563eb' }}>
            support@collegecompass.in
          </a>
          .
        </P>
      </Section>
    </LegalLayout>
  )
}
