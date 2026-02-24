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

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Button asChild variant="ghost" className="mb-8 -ml-2">
          <Link to={createPageUrl('Home')}><ArrowLeft className="w-4 h-4 mr-2" />Back to Home</Link>
        </Button>

        <h1 className="text-4xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-slate-500 mb-10">Last updated: February 2026</p>

        <Section title="1. Acceptance of Terms">
          <p>
            By registering for or participating in any Skill Samurai Academy program, you agree to be bound by these Terms of Service. These terms apply to students, parents, guardians, and any other users of our platform or programs.
          </p>
        </Section>

        <Section title="2. Enrollment and Registration">
          <ul className="list-disc pl-6 space-y-1">
            <li>Enrollment is confirmed upon receipt of full payment or execution of a payment plan.</li>
            <li>All student registrations must be completed by a parent or legal guardian for students under 18.</li>
            <li>Accurate information must be provided at registration, including emergency contacts and any relevant medical or learning needs.</li>
            <li>Skill Samurai Academy reserves the right to decline or terminate enrollment at its discretion.</li>
          </ul>
        </Section>

        <Section title="3. Program Terms">
          <p>
            Programs run in 12-week terms (3 terms per school year: September, January, and April). Holiday camps run independently during school break periods.
          </p>
          <p>
            Classes are held once per week at a fixed day and time for the duration of the term. Consistent attendance is encouraged to support learning continuity.
          </p>
        </Section>

        <Section title="4. Payment Terms">
          <ul className="list-disc pl-6 space-y-1">
            <li>Membership fees are charged monthly via Stripe.</li>
            <li>The standard membership is $99/month (12-month agreement) covering weekly classes throughout the school year, a 1-week summer camp, and a program t-shirt.</li>
            <li>Payments are non-refundable after the 7-day cooling-off period.</li>
            <li>Failed payments may result in suspension of access until the balance is settled.</li>
            <li>Prices may change at the start of a new school year with 30 days' notice.</li>
          </ul>
        </Section>

        <Section title="5. Cancellation and Refund Policy">
          <p><strong>Cooling-off period:</strong> You may cancel within 7 days of initial enrollment for a full refund.</p>
          <p><strong>After cooling-off:</strong> Monthly fees already charged are non-refundable. You may cancel future payments by providing 30 days' written notice to your local franchise operator.</p>
          <p><strong>Program cancellation by Skill Samurai:</strong> If we cancel a class or program, we will offer a credit, replacement session, or prorated refund at our discretion.</p>
        </Section>

        <Section title="6. Code of Conduct">
          <p>All students, parents, and volunteers are expected to uphold the Skill Samurai values: respect, perseverance, teamwork, and responsibility.</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Bullying, harassment, or discrimination of any kind will not be tolerated.</li>
            <li>Students are expected to treat equipment, staff, and peers with care and respect.</li>
            <li>Persistent disruptive behaviour may result in removal from the program without refund.</li>
          </ul>
        </Section>

        <Section title="7. Waiver of Liability">
          <p>
            Participation in Skill Samurai Academy programs is voluntary. While we take all reasonable precautions to ensure participant safety, Skill Samurai Academy and its franchisees are not liable for personal injury, property damage, or loss arising from participation in programs, except where caused by gross negligence.
          </p>
          <p>
            By enrolling, parents and guardians acknowledge and accept these risks.
          </p>
        </Section>

        <Section title="8. Intellectual Property">
          <p>
            All curriculum content, lesson materials, platform software, and brand assets are the intellectual property of Skill Samurai Academy. Students and parents may not reproduce, distribute, or sell any program materials without written permission.
          </p>
          <p>
            Student-created projects remain the property of the student, but Skill Samurai Academy may use anonymised student work for educational or promotional purposes.
          </p>
        </Section>

        <Section title="9. Photography and Media">
          <p>
            Skill Samurai Academy may photograph or video sessions for training, marketing, or social media purposes. You may opt out by notifying your location operator in writing at enrollment.
          </p>
        </Section>

        <Section title="10. Changes to Terms">
          <p>
            We may update these terms at any time. Material changes will be communicated by email with 14 days' notice. Continued participation constitutes acceptance of updated terms.
          </p>
        </Section>

        <Section title="11. Governing Law">
          <p>
            These terms are governed by the laws of the jurisdiction in which your enrolled Skill Samurai Academy location operates.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            For questions about these terms, contact: <a href="mailto:legal@skillsamurai.academy" className="text-indigo-600 hover:underline">legal@skillsamurai.academy</a>
          </p>
        </Section>

        <div className="mt-12 pt-8 border-t border-slate-200 text-sm text-slate-500">
          <p>Related: <Link to={createPageUrl('PrivacyPolicy')} className="text-indigo-600 hover:underline">Privacy Policy</Link></p>
        </div>
      </div>
    </div>
  );
}
