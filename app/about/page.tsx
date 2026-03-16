import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About GrantLocate — Finding Opportunities. Empowering Growth.",
  description:
    "GrantLocate is a developer-led grant discovery platform founded in 2026, committed to making federal and public funding accessible to everyone.",
};

export default function AboutPage() {
  return (
    <div className="container">
      <div className="static-page">
        <h1>About GrantLocate</h1>
        <p className="static-intro">
          Finding Opportunities. Empowering Growth.
        </p>

        <section className="static-section">
          <h2>Our Mission</h2>
          <p>
            Founded in 2026, GrantLocate was built on a simple belief: grant
            funding should be discoverable by anyone, not just those with access
            to expensive consultants or institutional resources. We apply
            developer-led search technology to index tens of thousands of active
            federal and public funding opportunities, making them searchable,
            filterable, and free to access.
          </p>
        </section>

        <section className="static-section">
          <h2>What Sets Us Apart</h2>
          <ul className="static-list">
            <li>
              <strong>Developer-Led Precision</strong> — our search and
              filtering infrastructure is purpose-built for grant discovery,
              not a generic directory bolted onto a CMS. Results are current,
              paginated from live government data, and optimized for relevance.
            </li>
            <li>
              <strong>Privacy-First Discovery</strong> — no account required,
              no email capture, no tracking of what you search for. Browse
              50,000+ grants without creating a profile or handing over
              personal data.
            </li>
            <li>
              <strong>Curation &amp; Context</strong> — beyond raw listings,
              we provide curated pages for specific audiences (small businesses,
              students, state-level seekers) with enough context to quickly
              assess fit before clicking through to the official source.
            </li>
          </ul>
        </section>

        <section className="static-section">
          <h2>Important Disclaimer</h2>
          <p>
            We are not a government agency and do not provide funding
            ourselves. GrantLocate is an independent directory that links to
            official program pages. Eligibility, award amounts, and deadlines
            are determined solely by the granting organization. Always verify
            details with the official source before applying.
          </p>
        </section>

        <section className="static-section">
          <h2>Contact</h2>
          <p>
            Questions or feedback?{" "}
            <a href="/contact">Reach out to our team</a> — we&apos;d love to
            hear from you.
          </p>
        </section>
      </div>
    </div>
  );
}
