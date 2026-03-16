import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — GrantLocate",
  description:
    "Privacy Policy for GrantLocate.com. Learn how we collect and protect your information.",
};

export default function PrivacyPage() {
  return (
    <div className="container">
      <div className="static-page">
        <h1>Privacy Policy</h1>
        <p className="static-meta">Last updated: March 16, 2026</p>
        <p className="static-intro">
          GrantLocate.com is committed to protecting your privacy. This policy
          explains what information we collect, how we use it, and what rights
          you have over your data.
        </p>

        <section className="static-section">
          <h2>Information We Collect</h2>
          <p>
            We collect minimal information to operate the site:
          </p>
          <ul className="static-list">
            <li>
              <strong>Search queries</strong> — entered keywords and filter
              selections are used to return results in your current session.
              They are not stored, profiled, or linked to your identity.
            </li>
            <li>
              <strong>Analytics</strong> — we use Google Analytics with
              anonymized IP addresses to understand aggregate traffic patterns
              (page views, referral sources, device types). No personally
              identifiable data is retained.
            </li>
            <li>
              <strong>Server logs</strong> — our hosting infrastructure
              automatically records standard request data (IP address, browser
              type, timestamp) for security and uptime monitoring only. These
              logs are not used for marketing or profiling.
            </li>
          </ul>
          <p>
            We do not require account registration and do not store user
            profiles, application data, or grant history.
          </p>
        </section>

        <section className="static-section">
          <h2>Advertising &amp; Google AdSense</h2>
          <p>
            GrantLocate displays ads served by Google AdSense. Google uses the
            DoubleClick cookie to serve ads based on users&apos; prior visits to
            this site and other sites on the internet.
          </p>
          <ul className="static-list">
            <li>
              To opt out of personalized advertising by Google, visit{" "}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Ad Settings
              </a>
              .
            </li>
            <li>
              To opt out of personalized ads from third-party vendors that use
              the IAB framework, visit{" "}
              <a
                href="https://www.aboutads.info/choices"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.aboutads.info/choices
              </a>
              .
            </li>
          </ul>
          <p>
            For more detail on how Google uses data when you use our site, see{" "}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
            >
              How Google uses information from sites that use our services
            </a>
            .
          </p>
        </section>

        <section className="static-section">
          <h2>Cookies</h2>
          <p>
            We use cookies for session functionality and advertising (Google
            AdSense). You can control cookie preferences through the consent
            banner displayed on your first visit or through your browser
            settings. Disabling cookies may affect ad personalization but will
            not prevent you from using the site.
          </p>
        </section>

        <section className="static-section">
          <h2>Your Rights (GDPR &amp; CCPA)</h2>
          <p>
            Depending on your location, you may have the following rights
            regarding your personal data:
          </p>
          <ul className="static-list">
            <li>
              <strong>Right to access</strong> — request a copy of any
              personal data we hold about you.
            </li>
            <li>
              <strong>Right to correction</strong> — request correction of
              inaccurate data.
            </li>
            <li>
              <strong>Right to deletion</strong> — request that we delete
              your data. Because we do not store user profiles or application
              data, there is typically nothing to delete beyond standard server
              logs, which are purged on a rolling basis.
            </li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:privacy@grantlocate.com">
              privacy@grantlocate.com
            </a>
            .
          </p>
        </section>

        <section className="static-section">
          <h2>Children&apos;s Privacy</h2>
          <p>
            GrantLocate is not directed at children under 13. We do not
            knowingly collect personal information from children under 13. If
            you believe a child has provided us with personal data, please
            contact us and we will promptly delete it.
          </p>
        </section>

        <section className="static-section">
          <h2>Changes to This Policy</h2>
          <p>
            We may update this policy periodically. The &ldquo;Last
            updated&rdquo; date at the top of this page reflects the most
            recent revision. Continued use of the site after changes
            constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="static-section">
          <h2>Contact</h2>
          <p>
            Questions about this Privacy Policy? Email{" "}
            <a href="mailto:privacy@grantlocate.com">
              privacy@grantlocate.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
