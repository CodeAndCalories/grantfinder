import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Financial Assistance Programs | GrantLocate",
  description:
    "Find financial assistance programs including utility help, food assistance, healthcare cost support, childcare subsidies, and more for individuals, families, and nonprofits.",
};

const CATEGORIES = [
  {
    icon: "⚡",
    title: "Utility Assistance",
    description:
      "LIHEAP and state energy assistance programs help low-income households pay heating, cooling, and electricity bills.",
  },
  {
    icon: "🍎",
    title: "Food Assistance",
    description:
      "SNAP, WIC, food banks, and community food programs provide nutritional support for qualifying individuals and families.",
  },
  {
    icon: "🏥",
    title: "Healthcare Cost Assistance",
    description:
      "Medicaid, CHIP, ACA subsidies, and charity care programs reduce medical costs for uninsured and underinsured patients.",
  },
  {
    icon: "👶",
    title: "Childcare Subsidies",
    description:
      "CCDF and state childcare assistance programs reduce the cost of childcare for working families with qualifying incomes.",
  },
  {
    icon: "🎓",
    title: "Education Financial Aid",
    description:
      "Pell Grants, state scholarships, and institutional aid programs support students who demonstrate financial need.",
  },
  {
    icon: "🚌",
    title: "Transportation Assistance",
    description:
      "State and local programs help low-income individuals access transportation for employment, healthcare, and essential services.",
  },
];

export default function FinancialAssistanceProgramsPage() {
  return (
    <>
      <div style={{ marginBottom: "1rem" }}>
        <Link href="/financial-help" className="detail-back">← Financial Help</Link>
      </div>

      <h1 className="page-title">Financial Assistance Programs</h1>
      <p className="page-subtitle">
        Federal and state programs that provide direct financial support to qualifying individuals and families
      </p>

      <div className="fh-notice" style={{ marginBottom: "2rem" }}>
        <strong>Coming Soon.</strong> We are building a comprehensive index of financial assistance programs across all
        50 states. In the meantime,{" "}
        <Link href="/grants">browse available grants</Link> in our current database.
      </div>

      <div className="fh-section">
        <h2 className="fh-section-title">Program Categories We Are Indexing</h2>
        <div className="fh-grid fh-grid--3">
          {CATEGORIES.map((cat) => (
            <div key={cat.title} className="fh-card">
              <div className="fh-card-icon">{cat.icon}</div>
              <h3 className="fh-card-title" style={{ fontSize: "1rem" }}>{cat.title}</h3>
              <p className="fh-card-desc">{cat.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="fh-section">
        <h2 className="fh-section-title">Related Resources</h2>
        <div className="fh-quick-links">
          <Link href="/grants" className="fh-quick-link">Browse All Grants</Link>
          <Link href="/housing-assistance-programs" className="fh-quick-link">Housing Assistance</Link>
          <Link href="/debt-relief-programs" className="fh-quick-link">Debt Relief Programs</Link>
          <Link href="/small-business-grants" className="fh-quick-link">Small Business Grants</Link>
        </div>
      </div>
    </>
  );
}
