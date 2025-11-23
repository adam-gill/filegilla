import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for the FileGilla App",
  openGraph: {
    images: "/ogLogo.png",
  },
};

const Privacy = () => {
  return (
    <>
      <div className="min-h-screen pt-16 text-gray-300">
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <h1 className="text-3xl font-bold text-white mb-6">
            Privacy Policy for FileGilla
          </h1>

          <p className="text-sm text-gray-400 mb-6">
            <em>Last updated: 9/18/2024 13:31</em>
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-300">
              Welcome to FileGilla (&#34;we,&#34; &#34;our,&#34; or
              &#34;us&#34;). We are committed to protecting your privacy and
              personal information. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our web
              application and related services (collectively, the
              &#34;Service&#34;).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">
              2. Information We Collect
            </h2>

            <h3 className="text-xl font-medium text-gray-200 mb-2">
              2.1 Information you provide to us:
            </h3>
            <ul className="list-disc list-inside text-gray-300 mb-4">
              <li>Account information (e.g., name, email address, password)</li>
              <li>
                Files and content you upload, store, or share through our
                Service
              </li>
              <li>Communications with us (e.g., customer support inquiries)</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-200 mb-2">
              2.2 Information collected automatically:
            </h3>
            <ul className="list-disc list-inside text-gray-300">
              <li>
                Usage data (e.g., access times, pages viewed, features used)
              </li>
              <li>
                Device information (e.g., IP address, browser type, operating
                system)
              </li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-300 mb-2">We use your information to:</p>
            <ul className="list-disc list-inside text-gray-300">
              <li>Provide, maintain, and improve our Service</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Send you important notices and updates</li>
              <li>
                Detect, prevent, and address technical issues or security
                threats
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">
              4. Data Storage and Security
            </h2>
            <p className="text-gray-300">
              We implement reasonable security measures to protect your
              information. However, no method of transmission or storage is 100%
              secure. We cannot guarantee absolute security of your data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">
              5. Sharing Your Information
            </h2>
            <p className="text-gray-300 mb-2">
              We do not sell your personal information. We may share your
              information in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-300">
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights, privacy, safety, or property</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">
              6. Your Rights and Choices
            </h2>
            <p className="text-gray-300 mb-2">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-300">
              <li>Access, update, or delete your personal information</li>
              <li>Opt-out of marketing communications</li>
              <li>Disable cookies through your browser settings</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">
              7. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-300">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the &#34;Last updated&#34; date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">
              8. Contact Us
            </h2>
            <p className="text-gray-300">
              If you have any questions about this Privacy Policy, please
              contact us at help@filegilla.com.
            </p>
          </section>
        </main>
      </div>
    </>
  );
};

export default Privacy;
