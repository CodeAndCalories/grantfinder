import type { Metadata } from "next";
import Link from "next/link";
import { getAllGrants, getUniqueIndustries } from "@/lib/grants";

export const metadata: Metadata = {
  title: "Browse Grants by Industry | GrantLocate",
  description:
    "Explore government grants and funding opportunities organized by industry. Find grants for small business, healthcare, education, research, environment, and more.",
};

function toSlug(industry: string): string {
  return industry.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function IndustryIndexPage() {
  const allGrants = getAllGrants();
  const industries = getUniqueIndustries();

  const industryCounts = industries
    .map((name) => ({
      name,
      slug: toSlug(name),
      count: allGrants.filter((g) => g.industry_tags.includes(name)).length,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <>
      <h1 className="page-title">Browse Grants by Industry</h1>
      <p className="page-subtitle">
        Find government grants and funding opportunities organized by sector and industry type.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "0.75rem",
          marginTop: "1.5rem",
        }}
      >
        {industryCounts.map(({ name, slug, count }) => (
          <Link
            key={slug}
            href={`/grants/${slug}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.85rem 1rem",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              background: "var(--surface)",
              textDecoration: "none",
              color: "var(--text)",
              fontWeight: 500,
              fontSize: "0.9rem",
              transition: "border-color 0.15s, color 0.15s",
            }}
          >
            <span>{name}</span>
            <span
              style={{
                background: "#eff6ff",
                color: "var(--primary)",
                borderRadius: "999px",
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "0.15rem 0.55rem",
              }}
            >
              {count}
            </span>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: "2rem" }}>
        <Link href="/grants" style={{ color: "var(--primary)", fontWeight: 600 }}>
          ← Browse all grants
        </Link>
      </div>
    </>
  );
}
