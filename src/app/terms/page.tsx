export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-sm text-gray-400 mt-2">Last updated: September 6, 2026</p>
        </div>

        <div className="space-y-8 text-gray-700 leading-relaxed text-sm">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Social Manager at social.codeinkstudio.com ("the Service"), operated by
              CodeInk Studio, you agree to be bound by these Terms of Service. If you do not agree to these terms,
              do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p>
              Social Manager is a social media management platform that allows users to connect social media accounts
              (Facebook, Instagram, LinkedIn, X/Twitter, Threads), schedule and publish content, manage team
              workflows, and analyze post performance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Account Registration</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must be at least 13 years of age to use the Service.</li>
              <li>One person or legal entity may not maintain more than one free account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Acceptable Use</h2>
            <p className="mb-3">You agree not to use the Service to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Publish spam, misleading, or deceptive content on any connected social platform.</li>
              <li>Violate any social media platform's terms of service or community guidelines.</li>
              <li>Distribute malware, phishing links, or harmful content.</li>
              <li>Attempt to gain unauthorized access to the Service or its infrastructure.</li>
              <li>Scrape, reverse-engineer, or resell the Service without written permission.</li>
              <li>Use the Service for any illegal purpose under applicable law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Social Media Platforms</h2>
            <p>
              When you connect a third-party social media account, you authorize Social Manager to publish content,
              read account data, and perform actions on your behalf as permitted by that platform. You remain
              responsible for all content published through the Service and must comply with each platform's own
              Terms of Service (Meta, LinkedIn, X Corp, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Content Ownership</h2>
            <p>
              You retain full ownership of all content you create and publish through Social Manager. By using the
              Service, you grant CodeInk Studio a limited, non-exclusive license to store and transmit your content
              solely for the purpose of operating the Service. We do not claim ownership of your content and will
              not use it for any purpose beyond delivering the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Workspace & Team Usage</h2>
            <p>
              Workspace owners are responsible for all activity within their workspace, including actions taken by
              team members they invite. Inviting a user grants them the permissions specified by the owner. Owners
              may remove members and revoke access at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Payments & Subscriptions</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Paid plans are billed monthly or annually in advance.</li>
              <li>Cancellations take effect at the end of the current billing period — no partial refunds.</li>
              <li>We reserve the right to change pricing with 30 days written notice.</li>
              <li>Failure to pay may result in account suspension or downgrade to the free plan.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Service Availability</h2>
            <p>
              We aim for high availability but do not guarantee uninterrupted access. Scheduled maintenance,
              third-party platform outages (Meta, LinkedIn, X), or force majeure events may affect the Service.
              We are not liable for any losses resulting from downtime outside our reasonable control.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, CodeInk Studio shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages arising from your use of the Service,
              including but not limited to lost revenue, lost data, or missed publishing opportunities.
              Our total liability to you shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time if you violate these Terms.
              You may delete your account at any time from Settings. Upon termination, your data will be deleted
              within 30 days as described in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Changes to Terms</h2>
            <p>
              We may update these Terms at any time. We will notify you of material changes via email or an
              in-app notice at least 14 days before they take effect. Continued use of the Service after changes
              take effect constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">13. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the jurisdiction in which CodeInk Studio operates.
              Any disputes shall be resolved through good-faith negotiation first, followed by binding arbitration
              if necessary.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">14. Contact</h2>
            <p>
              For questions about these Terms, contact us at{' '}
              <a href="mailto:support@codeinkstudio.com" className="text-emerald-600 underline">
                support@codeinkstudio.com
              </a>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
