import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — GrantLocate",
  description: "Contact the GrantLocate team with questions about grants or to suggest a listing.",
};

export default function ContactPage() {
  return (
    <div className="container">
      <div className="static-page">
        <h1>Contact GrantLocate</h1>
        <p className="static-intro">
          Have questions about a grant or want to suggest a listing?
        </p>

        <section className="static-section">
          <h2>Email Us</h2>
          <p>
            Reach out to our team at{" "}
            <a href="mailto:info@grantlocate.com">info@grantlocate.com</a>.
          </p>
        </section>

        <section className="static-section">
          <h2>Response Time</h2>
          <p>We typically respond within 48 hours.</p>
        </section>

        <section className="static-section">
          <h2>Suggest a Grant Listing</h2>
          <p>
            Know of a grant, relief fund, or assistance program that should be listed on
            GrantLocate? Email us with the program name, funding amount, deadline, and a link
            to the official source and we will review it for inclusion.
          </p>
        </section>
      </div>
    </div>
  );
}
