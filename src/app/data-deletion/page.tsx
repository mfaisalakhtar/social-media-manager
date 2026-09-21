export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Data Deletion Request</h1>
          <p className="text-sm text-gray-400 mt-2">Last updated: September 6, 2026</p>
        </div>

        <div className="space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">How to Delete Your Data</h2>
            <p>
              You can request deletion of all your data from Social Manager at any time. We offer
              two ways to do this:
            </p>
          </section>

          <section className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
            <h3 className="text-base font-semibold text-emerald-900 mb-2">Option 1 — Delete from within the app</h3>
            <ol className="list-decimal pl-5 space-y-1 text-emerald-800 text-sm">
              <li>Log in to your account at <a href="https://social.codeinkstudio.com" className="underline">social.codeinkstudio.com</a></li>
              <li>Go to <strong>Settings</strong></li>
              <li>Scroll to the bottom and click <strong>"Delete Account"</strong></li>
              <li>Confirm deletion — all your data will be permanently removed within 30 days</li>
            </ol>
          </section>

          <section className="bg-gray-50 border border-gray-100 rounded-xl p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Option 2 — Submit a deletion request by email</h3>
            <p className="text-sm text-gray-600 mb-3">
              If you no longer have access to your account, email us and we will manually delete your data.
            </p>
            <a
              href="mailto:support@codeinkstudio.com?subject=Data Deletion Request&body=Please delete all data associated with my account. My registered email is: "
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Email us at support@codeinkstudio.com
            </a>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">What Gets Deleted</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Your account and profile information</li>
              <li>All posts and drafts you created</li>
              <li>All connected social accounts and their OAuth tokens</li>
              <li>All media files you uploaded</li>
              <li>All workspace data associated with your account</li>
              <li>All analytics and audit logs tied to your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Facebook / Instagram Data</h2>
            <p className="text-sm">
              If you connected your Facebook or Instagram account, you can also revoke our app's
              access directly from Facebook:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-sm mt-2">
              <li>Go to <strong>Facebook Settings → Security and Login → Apps and Websites</strong></li>
              <li>Find <strong>Social Manager</strong> and click <strong>Remove</strong></li>
            </ol>
            <p className="text-sm mt-3">
              This revokes our access to your Facebook/Instagram data immediately. Any tokens we
              stored will be invalidated and deleted within 24 hours.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Timeline</h2>
            <p className="text-sm">
              All deletion requests are processed within <strong>30 days</strong>. You will receive
              a confirmation email once your data has been fully deleted.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
