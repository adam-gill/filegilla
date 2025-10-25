import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for the FileGilla App",
  openGraph: {
    images: "/ogLogo.png",
    },
};

const Terms = () => {
  return (
    <>
      <div className="min-h-screen text-gray-300">
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <h1 className="text-3xl font-bold text-white mb-6">
            Terms of Service for FileGilla
          </h1>

          <p className="text-sm text-gray-400 mb-6">
            <em>Last updated: 9/9/2024 13:48</em>
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-300">
              By accessing or using FileGilla(the &#34;Service&#34;), you agree
              to be bound by these Terms of Service (&#34;Terms&#34;). If you disagree
              with any part of the terms, you may not access the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">
              2. Description of Service
            </h2>
            <p className="text-gray-300">
              FileGilla is a web-based application that provides digital storage services. We reserve the right to modify,
              suspend, or discontinue the Service at any time without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">
              3. User Accounts
            </h2>
            <p className="text-gray-300 mb-2">
              To use certain features of the Service, you must create an
              account. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-300">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly update any changes to your information</li>
              <li>
                Accept responsibility for all activities that occur under your
                account
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">
              4. User Content
            </h2>
            <p className="text-gray-300">
              You retain ownership of any content you upload to the Service. By
              uploading content, you grant us a worldwide, non-exclusive,
              royalty-free license to use, reproduce, and distribute your
              content in connection with the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">
              5. Prohibited Conduct
            </h2>
            <p className="text-gray-300 mb-2">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-300">
              <li>Use the Service for any illegal purpose</li>
              <li>Violate any laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Attempt to gain unauthorized access to the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">
              6. Intellectual Property
            </h2>
            <p className="text-gray-300">
              The Service and its original content, features, and functionality
              are owned by FileGilla and are protected by
              international copyright, trademark, patent, trade secret, and
              other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">
              7. Limitation of Liability
            </h2>
            <p className="text-gray-300">
              In no event shall FileGilla, nor its directors,
              employees, partners, agents, suppliers, or affiliates, be liable
              for any indirect, incidental, special, consequential or punitive
              damages, including without limitation, loss of profits, data, use,
              goodwill, or other intangible losses, resulting from your access
              to or use of or inability to access or use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">
              8. Termination
            </h2>
            <p className="text-gray-300">
              We may terminate or suspend your account and bar access to the
              Service immediately, without prior notice or liability, under our
              sole discretion, for any reason whatsoever and without limitation,
              including but not limited to a breach of the Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">
              9. Changes to Terms
            </h2>
            <p className="text-gray-300">
              We reserve the right to modify or replace these Terms at any time.
              We will provide notice of any material changes by posting the new
              Terms on this page. Your continued use of the Service after any
              such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">
              10. Contact Us
            </h2>
            <p className="text-gray-300">
              If you have any questions about these Terms, please contact us at
              help@filegilla.com.
            </p>
          </section>
        </main>
      </div>
    </>
  );
};

export default Terms;
