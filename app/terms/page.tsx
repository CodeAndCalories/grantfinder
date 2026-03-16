import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — GrantLocate",
  description:
    "GrantLocate Terms of Service. Information is provided for informational purposes only. Always verify grant details with official sources.",
};

export default function TermsPage() {
  return (
    <div className="container">
      <div className="static-page">
        <h1>Terms of Service</h1>
        <p className="static-meta">Last updated: March 16, 2026</p>
        <p className="static-intro">
          Please read these Terms of Service carefully before using
          GrantLocate.com. By accessing or using the site, you agree to be
          bound by these terms.
        </p>

        <section className="static-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By using GrantLocate.com you confirm that you have read, understood,
            and agree to these Terms of Service and our{" "}
            <a href="/privacy">Privacy Policy</a>. If you do not agree, please
            discontinue use of the site.
          </p>
        </section>

        <section className="static-section">
          <h2>2. Disclaimer — Informational Use Only</h2>
          <p>
            All content on GrantLocate is provided for informational purposes
            only. We aggregate publicly available grant and funding information
            from government agencies, nonprofit organizations, and other public
            sources. While we strive for accuracy, we make no representations
            or warranties regarding the completeness, accuracy, timeliness, or
            suitability of any listing. Deadlines, eligibility criteria, award
            amounts, and fund availability are subject to change and may differ
            from what is displayed. Always verify details directly with the
            official grant source before submitting an application.
          </p>
        </section>

        <section className="static-section">
          <h2>3. Not Professional Advice</h2>
          <p>
            GrantLocate is not staffed by financial advisors, attorneys, or
            professional grant writers. Nothing on this site constitutes
            financial, legal, or grant-writing advice. You should consult a
            qualified professional before making decisions based on information
            found here.
          </p>
        </section>

        <section className="static-section">
          <h2>4. No Endorsement or Guarantee of Funding</h2>
          <p>
            Listing a grant or program on GrantLocate does not constitute an
            endorsement of that program, nor does it guarantee that you are
            eligible for or will receive funding. GrantLocate is not affiliated
            with any government agency or granting organization. All funding
            decisions are made solely by the relevant granting authority.
          </p>
        </section>

        <section className="static-section">
          <h2>5. Prohibited Use</h2>
          <p>You agree not to:</p>
          <ul className="static-list">
            <li>
              Use automated tools (scrapers, bots, crawlers) to extract data
              from GrantLocate in bulk without prior written permission.
            </li>
            <li>
              Use the site for any unlawful purpose or in violation of any
              applicable laws or regulations.
            </li>
            <li>
              Engage in any conduct that could damage, disable, or impair the
              availability of the site for other users.
            </li>
          </ul>
        </section>

        <section className="static-section">
          <h2>6. Third-Party Links</h2>
          <p>
            GrantLocate links to external government and nonprofit websites. We
            are not responsible for the content, accuracy, privacy practices,
            or availability of those external sites.
          </p>
        </section>

        <section className="static-section">
          <h2>7. Changes to These Terms</h2>
          <p>
            We may update these Terms of Service from time to time. The
            &ldquo;Last updated&rdquo; date at the top reflects the most recent
            revision. Continued use of GrantLocate after changes constitutes
            acceptance of the updated terms.
          </p>
        </section>

        <section className="static-section">
          <h2>Contact</h2>
          <p>
            Questions about these terms?{" "}
            <a href="/contact">Contact us</a> or email{" "}
            <a href="mailto:hello@grantlocate.com">hello@grantlocate.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
