import type { Metadata } from "next";
import Link from "next/link";
import { getAllGrants } from "@/lib/grants";
import GrantCard from "@/components/GrantCard";

export const metadata: Metadata = {
  title: "Small Business Grants | GrantLocate",
  description:
    "Find small business grants from federal, state, and nonprofit sources. Search funding opportunities for entrepreneurs, startups, and established small businesses across the US.",
};

const SMALL_BIZ_TAGS = [
  "Small Business",
  "Entrepreneurship",
  "Economic Development",
  "Manufacturing",
];

export default function SmallBusinessGrantsPage() {
  const allGrants = getAllGrants();
  const sbGrants = allGrants.filter((g) =>
    g.industry_tags.some((tag) => SMALL_BIZ_TAGS.includes(tag))
  );

  return (
    <>
      <div style={{ marginBottom: "1rem" }}>
        <Link href="/financial-help" className="detail-back">← Financial Help</Link>
      </div>

      <h1 className="page-title">Small Business Grants</h1>
      <p className="page-subtitle">
        {sbGrants.length} grants available for entrepreneurs, startups, and small businesses
      </p>

      <div className="fh-section" style={{ marginBottom: "1.5rem" }}>
        <p style={{ fontSize: "0.95rem", lineHeight: 1.7 }}>
          Small businesses are the backbone of the American economy. Federal agencies, state governments, and
          nonprofit foundations offer billions of dollars in grants each year to support entrepreneurs and small
          business owners. Use the filters on our{" "}
          <Link href="/grants">main grants page</Link> to search by location, industry, and funding amount, or browse
          the matching programs below.
        </p>
      </div>

      <div className="fh-quick-links" style={{ marginBottom: "1.5rem" }}>
        <Link href="/grants" className="fh-quick-link">All Grants</Link>
        <Link href="/debt-relief-programs" className="fh-quick-link">Debt Relief</Link>
        <Link href="/financial-assistance-programs" className="fh-quick-link">Financial Assistance</Link>
      </div>

      <div className="results-bar">
        <span className="results-count">{sbGrants.length} grants found</span>
      </div>

      <div className="grants-list">
        {sbGrants.map((grant) => (
          <GrantCard key={grant.id} grant={grant} />
        ))}
      </div>
    </>
  );
}
