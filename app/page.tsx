export const revalidate = 3600;

import type { Metadata } from "next";
import Link from "next/link";
import { getLiveGrantsPage } from "@/lib/fetchLiveGrants";
import { formatCurrency } from "@/lib/grants";

export const metadata: Metadata = {
  title: "GrantLocate | Find Government Grants for Businesses and Nonprofits",
  description:
    "Search 50,000+ government grants and funding opportunities for businesses, nonprofits, students, and researchers across the United States.",
};

function toSlug(industry: string): string {
  return industry.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const CATEGORY_EMOJIS: Record<string, string> = {
  "Small Business": "💼",
  "Education": "📚",
  "Healthcare": "🏥",
  "Research": "🔬",
  "Environment": "🌿",
  "Community": "🏘️",
  "Housing": "🏠",
  "Technology": "💻",
  "Agriculture": "🌾",
  "Workforce Development": "👷",
};

export default async function HomePage() {
  const { grants } = await getLiveGrantsPage(1);
  const latest = grants.slice(0, 5);

  return (
    <>
      {/* Hero */}
      <div style={{ textAlign: "center", padding: "3rem 1rem 1.5rem" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: 800, marginBottom: "0.75rem" }}>
          Find Government Grants
        </h1>
        <p style={{ fontSize: "1.1rem", color: "var(--muted)", maxWidth: "600px", margin: "0 auto 1.5rem", lineHeight: 1.6 }}>
          Search 50,000+ active grants and funding opportunities for businesses,
          nonprofits, students, and researchers across the United States.
        </p>

        {/* Hero search bar */}
        <form action="/grants" method="GET" className="hero-search-form">
          <input
            type="text"
            name="search"
            placeholder="Search grants by keyword, agency, or topic..."
            className="hero-search-input"
          />
          <button type="submit" className="hero-search-btn">Search</button>
        </form>

        <div style={{ marginTop: "1rem" }}>
          <Link
            href="/grants"
            className="btn-primary"
            style={{ display: "inline-block", fontSize: "1rem", padding: "0.75rem 2rem" }}
          >
            Browse All Grants →
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="stats-bar">
        <span>✓ 900+ Live Federal Grants</span>
        <span>✓ Updated Every Hour</span>
        <span>✓ 100% Free — No Account Required</span>
      </div>

      {/* Latest Grants */}
      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
          Latest Grant Opportunities
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {latest.map((grant) => (
            <Link
              key={grant.id}
              href={`/grants/${grant.id}`}
              style={{
                display: "block",
                padding: "1rem 1.25rem",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                background: "var(--surface)",
                textDecoration: "none",
                color: "inherit",
                transition: "border-color 0.15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text)" }}>
                  {grant.title}
                </span>
                <span style={{ fontWeight: 700, color: "var(--primary)", whiteSpace: "nowrap", fontSize: "0.9rem" }}>
                  {grant.funding_amount != null ? formatCurrency(grant.funding_amount) : "Varies"}
                </span>
              </div>
              <div style={{ marginTop: "0.35rem", fontSize: "0.8rem", color: "var(--muted)" }}>
                {grant.location} &nbsp;·&nbsp; Deadline:{" "}
                {grant.deadline
                  ? new Date(grant.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "See listing"}
                {grant.industry_tags.length > 0 && (
                  <> &nbsp;·&nbsp; {grant.industry_tags.slice(0, 2).join(", ")}</>
                )}
              </div>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: "1.25rem" }}>
          <Link href="/grants" style={{ fontWeight: 600, color: "var(--primary)" }}>
            View all grants →
          </Link>
        </div>
      </section>

      {/* Browse by category */}
      <section style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
          Browse by Category
        </h2>
        <div className="category-grid">
          {[
            "Small Business", "Education", "Healthcare", "Research",
            "Environment", "Community", "Housing", "Technology",
            "Agriculture", "Workforce Development",
          ].map((cat) => (
            <Link
              key={cat}
              href={`/grants/${toSlug(cat)}`}
              className="category-card"
            >
              <span className="category-card-emoji">{CATEGORY_EMOJIS[cat] ?? "📋"}</span>
              <span className="category-card-label">{cat}</span>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: "1rem" }}>
          <Link href="/grants/industry" className="tag" style={{ textDecoration: "none", fontWeight: 600 }}>
            All Industries →
          </Link>
        </div>
      </section>
    </>
  );
}
