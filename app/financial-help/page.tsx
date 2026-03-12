import type { Metadata } from "next";
import Link from "next/link";
import { getAllGrants } from "@/lib/grants";

export const metadata: Metadata = {
  title: "Financial Help Programs | GrantLocate",
  description:
    "Find grants, relief funds, assistance programs, and hardship support for individuals, businesses, and nonprofits across the United States.",
};

const CATEGORIES = [
  {
    type: "grant" as const,
    label: "Grants",
    icon: "🏛️",
    description: "Government and foundation grants for businesses, nonprofits, research, and community projects.",
    href: "/grants",
    available: true,
  },
  {
    type: "relief_fund" as const,
    label: "Relief Funds",
    icon: "🤝",
    description: "Emergency and disaster relief funds for individuals, families, and businesses facing hardship.",
    href: null,
    available: false,
  },
  {
    type: "assistance_program" as const,
    label: "Assistance Programs",
    icon: "🏠",
    description: "Housing, utility, food, and other assistance programs for qualifying households and organizations.",
    href: null,
    available: false,
  },
  {
    type: "hardship_support" as const,
    label: "Hardship Support",
    icon: "💙",
    description: "Debt relief, financial counseling, and support programs for those experiencing financial difficulty.",
    href: null,
    available: false,
  },
];

const QUICK_LINKS = [
  { label: "Debt Relief Programs", href: "/debt-relief-programs" },
  { label: "Housing Assistance", href: "/housing-assistance-programs" },
  { label: "Small Business Grants", href: "/small-business-grants" },
  { label: "Financial Assistance Programs", href: "/financial-assistance-programs" },
];

export default function FinancialHelpPage() {
  const grantCount = getAllGrants().length;

  return (
    <>
      <h1 className="page-title">Financial Help Programs</h1>
      <p className="page-subtitle">
        Discover grants, relief funds, and financial assistance programs across the United States
      </p>

      {/* Category cards */}
      <div className="fh-grid" style={{ marginBottom: "2.5rem" }}>
        {CATEGORIES.map((cat) => (
          <div key={cat.type} className={`fh-card${cat.available ? " fh-card--active" : ""}`}>
            <div className="fh-card-icon">{cat.icon}</div>
            <h2 className="fh-card-title">{cat.label}</h2>
            <p className="fh-card-desc">{cat.description}</p>
            {cat.available ? (
              <Link href={cat.href!} className="fh-card-link">
                Browse {grantCount} {cat.label} →
              </Link>
            ) : (
              <span className="fh-coming-soon">Coming Soon</span>
            )}
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="fh-section">
        <h2 className="fh-section-title">Browse by Category</h2>
        <div className="fh-quick-links">
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="fh-quick-link">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Coming soon notice */}
      <div className="fh-notice">
        <strong>More programs coming soon.</strong> We are actively indexing relief funds, assistance programs, and
        hardship support resources. Check back soon or{" "}
        <Link href="/grants">browse available grants</Link> now.
      </div>
    </>
  );
}
