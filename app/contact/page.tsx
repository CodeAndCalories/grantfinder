import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — GrantLocate",
  description:
    "Contact the GrantLocate team for general inquiries, data and privacy questions, or technical support.",
};

export default function ContactPage() {
  return (
    <div className="container">
      <div className="static-page">
        <h1>Contact GrantLocate</h1>
        <p className="static-intro">
          GrantLocate is a developer-led project based in the United States. We
          read every message and typically respond within 48 business hours.
        </p>

        <section className="static-section">
          <h2>General Inquiries</h2>
          <p>
            Questions about grants, site features, or partnership
            opportunities:
          </p>
          <p>
            <a href="mailto:hello@grantlocate.com">hello@grantlocate.com</a>
          </p>
        </section>

        <section className="static-section">
          <h2>Data &amp; Privacy</h2>
          <p>
            Requests related to personal data, GDPR/CCPA rights, or our{" "}
            <a href="/privacy">Privacy Policy</a>:
          </p>
          <p>
            <a href="mailto:privacy@grantlocate.com">
              privacy@grantlocate.com
            </a>
          </p>
        </section>

        <section className="static-section">
          <h2>Technical Support</h2>
          <p>Reporting a bug, broken link, or site issue:</p>
          <p>
            <a href="mailto:support@grantlocate.com">
              support@grantlocate.com
            </a>
          </p>
        </section>

        <section className="static-section">
          <h2>Suggest a Grant Listing</h2>
          <p>
            Know of a grant, relief fund, or assistance program we should
            include? Email{" "}
            <a href="mailto:hello@grantlocate.com">hello@grantlocate.com</a>{" "}
            with the program name, funding amount, deadline, and a link to the
            official source and we will review it for inclusion.
          </p>
        </section>
      </div>
    </div>
  );
}
