import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — GrantLocate",
  description:
    "GrantLocate Terms of Service. Information provided is for informational purposes only. Always verify grant details with official sources.",
};

export default function TermsPage() {
  return (
    <div className="container">
      <div className="static-page">
        <h1>Terms of Service</h1>
        <p className="static-intro">
          The information provided on GrantLocate is for informational purposes
          only.
        </p>

        <section className="static-section">
          <h2>Informational Use Only</h2>
          <p>
            GrantLocate aggregates publicly available grant and financial
            assistance information from government agencies, nonprofit
            organizations, and other public sources.
          </p>
          <p>
            While we strive to keep information accurate and up to date, users
            should always verify details directly with the official grant
            provider before applying.
          </p>
        </section>

        <section className="static-section">
          <h2>No Guarantee of Funding</h2>
          <p>
            GrantLocate does not guarantee funding approval and is not
            affiliated with any government agency. Listing a grant or program
            on this site does not imply endorsement or guarantee of eligibility.
          </p>
        </section>

        <section className="static-section">
          <h2>Third-Party Links</h2>
          <p>
            GrantLocate links to external government and nonprofit websites.
            We are not responsible for the content, accuracy, or availability
            of those external sites. Always read the official program guidelines
            before submitting any application.
          </p>
        </section>

        <section className="static-section">
          <h2>Changes to These Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of
            GrantLocate constitutes acceptance of any updated terms.
          </p>
        </section>

        <section className="static-section">
          <h2>Contact</h2>
          <p>
            Questions about these terms? <a href="/contact">Contact us</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
