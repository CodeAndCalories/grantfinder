import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About GrantLocate — Grant & Financial Assistance Directory",
  description:
    "GrantLocate is a directory helping businesses, nonprofits, researchers, and students discover funding opportunities across the United States.",
};

export default function AboutPage() {
  return (
    <div className="container">
      <div className="static-page">
        <h1>About GrantLocate</h1>
        <p className="static-intro">
          GrantLocate is a directory designed to help businesses, nonprofits,
          researchers, and students discover funding opportunities across the
          United States.
        </p>

        <section className="static-section">
          <h2>What We Do</h2>
          <p>
            Our platform aggregates grants and financial assistance programs
            from federal, state, and nonprofit sources, making it easier to
            explore available funding opportunities in one place.
          </p>
          <p>
            GrantLocate continues expanding to include relief funds, assistance
            programs, and hardship support resources.
          </p>
        </section>

        <section className="static-section">
          <h2>Who We Help</h2>
          <p>
            We serve a wide range of users including small business owners,
            nonprofit organizations, academic researchers, community groups,
            and individuals seeking financial assistance. Whether you are
            looking for federal grants, state-level funding, or community
            relief programs, GrantLocate helps you find and explore your
            options.
          </p>
        </section>

        <section className="static-section">
          <h2>Our Data</h2>
          <p>
            All grant and assistance program information on GrantLocate is
            sourced from publicly available government agencies, nonprofit
            organizations, and official program websites. We strive to keep
            listings accurate and up to date. Users should always verify
            details directly with the official program source before applying.
          </p>
        </section>

        <section className="static-section">
          <h2>Contact Us</h2>
          <p>
            Have a question or want to suggest a grant listing?{" "}
            <a href="/contact">Contact our team</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
