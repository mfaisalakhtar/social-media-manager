export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mt-2">Last updated: September 6, 2026</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              Social Manager ("we", "our", or "us"), operated by CodeInk Studio, is a social media
              management platform that allows users to connect and manage their social media accounts,
              schedule posts, and analyze performance. This Privacy Policy explains how we collect,
              use, and protect your information when you use our service at{' '}
              <a href="https://social.codeinkstudio.com" className="text-emerald-600 underline">
                social.codeinkstudio.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account information:</strong> Name, email address, and password when you register.</li>
              <li><strong>Social media tokens:</strong> OAuth access tokens for platforms you connect (Facebook, Instagram, LinkedIn, X, Threads). These are encrypted before storage.</li>
              <li><strong>Content:</strong> Posts, images, and captions you create within the platform.</li>
              <li><strong>Usage data:</strong> Pages visited, features used, and actions taken within the app.</li>
              <li><strong>Social profile data:</strong> Public profile information (name, username, profile picture) from connected social accounts.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide and operate the Social Manager service.</li>
              <li>To publish and schedule posts to your connected social accounts on your behalf.</li>
              <li>To authenticate you and keep your account secure.</li>
              <li>To improve the platform based on usage patterns.</li>
              <li>To send important service notifications.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Meta Platform Data</h2>
            <p>
              When you connect your Facebook or Instagram account, we access data through the Meta
              Platform APIs in accordance with Meta's Platform Terms. We only request permissions
              necessary to provide the service (posting, reading page data, and analytics). We do not
              sell or share your Meta platform data with third parties. You can revoke our access at
              any time through your Facebook or Instagram settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Storage & Security</h2>
            <p>
              Your data is stored securely using Supabase (PostgreSQL). OAuth access tokens are
              encrypted at the application level before being stored — we never store tokens in
              plaintext. We use HTTPS for all data transmission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Sharing</h2>
            <p>
              We do not sell your personal information. We share data only with:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Meta (Facebook/Instagram):</strong> To publish content on your behalf.</li>
              <li><strong>LinkedIn, X (Twitter), Threads:</strong> To publish content on your behalf.</li>
              <li><strong>Supabase:</strong> Our database and authentication provider.</li>
              <li><strong>Vercel:</strong> Our hosting provider.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Your Rights</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access, update, or delete your account at any time from Settings.</li>
              <li>Disconnect any social account from the Connections page.</li>
              <li>Request a full export or deletion of your data by contacting us.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. When you delete your account,
              we permanently delete your data within 30 days. Social media tokens are deleted immediately
              when you disconnect an account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or want to request data deletion, contact us at:{' '}
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
