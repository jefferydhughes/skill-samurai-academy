import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-xl font-bold text-slate-900 mb-3">{title}</h2>
    <div className="text-slate-600 leading-relaxed space-y-3">{children}</div>
  </section>
);

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Button asChild variant="ghost" className="mb-8 -ml-2">
          <Link to={createPageUrl('Home')}><ArrowLeft className="w-4 h-4 mr-2" />Back to Home</Link>
        </Button>

        <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-500 mb-10">Last updated: February 2026</p>

        <Section title="1. Introduction">
          <p>
            Skill Samurai Academy ("we", "us", or "our") is committed to protecting the privacy of all individuals who interact with our platform, particularly children. This Privacy Policy describes how we collect, use, and safeguard personal information in compliance with applicable privacy laws, including COPPA (Children's Online Privacy Protection Act) and PIPEDA (Personal Information Protection and Electronic Documents Act).
          </p>
          <p>
            By using our platform, you agree to the collection and use of information in accordance with this policy.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p><strong>From Parents and Guardians:</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Name, email address, and phone number</li>
            <li>Billing information (processed securely via Stripe)</li>
            <li>Location/postal code for finding nearby programs</li>
          </ul>
          <p><strong>From Students (collected via parent/guardian):</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li>First name and age/date of birth</li>
            <li>Program enrollment and attendance records</li>
            <li>Learning progress, achievements, and badges earned</li>
          </ul>
          <p><strong>Automatically collected:</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Device type, browser, and operating system</li>
            <li>Pages visited and session duration (anonymised analytics only)</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul className="list-disc pl-6 space-y-1">
            <li>To manage enrollments, bookings, and class schedules</li>
            <li>To process payments and send receipts</li>
            <li>To communicate program updates, reminders, and safety notices</li>
            <li>To provide progress reports and learning summaries to parents</li>
            <li>To improve our curriculum and platform experience</li>
            <li>To comply with legal and regulatory obligations</li>
          </ul>
          <p>We do <strong>not</strong> sell personal information to third parties.</p>
        </Section>

        <Section title="4. Children's Privacy (COPPA Compliance)">
          <p>
            We do not knowingly collect personal information directly from children under 13 without verifiable parental consent. All student accounts are created and managed by a parent or guardian. Parents may request to review, update, or delete their child's information at any time by contacting us.
          </p>
        </Section>

        <Section title="5. Data Storage and Security">
          <p>
            All data is stored securely using Supabase infrastructure with industry-standard encryption at rest and in transit. Payment information is handled exclusively by Stripe and is never stored on our servers.
          </p>
          <p>
            We retain personal data only as long as necessary to provide our services or as required by law. Enrollment records are typically retained for up to 3 years after the last active enrollment.
          </p>
        </Section>

        <Section title="6. Third-Party Services">
          <p>We use the following third-party services which have their own privacy policies:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Supabase</strong> — database and authentication</li>
            <li><strong>Stripe</strong> — payment processing</li>
            <li><strong>Vercel</strong> — application hosting</li>
          </ul>
        </Section>

        <Section title="7. Your Rights">
          <p>Depending on your location, you may have rights to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access the personal information we hold about you</li>
            <li>Correct inaccurate or incomplete data</li>
            <li>Request deletion of your data ("right to be forgotten")</li>
            <li>Withdraw consent for marketing communications</li>
          </ul>
          <p>To exercise any of these rights, contact us at <a href="mailto:privacy@skillsamurai.academy" className="text-indigo-600 hover:underline">privacy@skillsamurai.academy</a>.</p>
        </Section>

        <Section title="8. Cookies">
          <p>
            We use essential cookies for session management and authentication. We do not use advertising or tracking cookies. You may disable cookies in your browser settings, but some features may not function correctly.
          </p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify registered users of material changes by email. Continued use of the platform after changes constitutes acceptance of the revised policy.
          </p>
        </Section>

        <Section title="10. Contact Us">
          <p>
            For privacy-related questions or requests, contact: <a href="mailto:privacy@skillsamurai.academy" className="text-indigo-600 hover:underline">privacy@skillsamurai.academy</a>
          </p>
        </Section>

        <div className="mt-12 pt-8 border-t border-slate-200 text-sm text-slate-500">
          <p>Related: <Link to={createPageUrl('TermsOfService')} className="text-indigo-600 hover:underline">Terms of Service</Link></p>
        </div>
      </div>
    </div>
  );
}
