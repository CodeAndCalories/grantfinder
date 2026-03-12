import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Housing Assistance Programs | GrantLocate",
  description:
    "Find housing assistance programs, rental help, homeowner aid, and affordable housing grants for individuals, families, and nonprofits across the United States.",
};

const PROGRAM_TYPES = [
  {
    title: "Emergency Rental Assistance",
    description:
      "Federal and state programs that provide short-term rental and utility assistance to households experiencing financial hardship due to job loss or other emergencies.",
  },
  {
    title: "HUD Housing Choice Vouchers",
    description:
      "Section 8 and other HUD-administered voucher programs that subsidize rent for low-income families, elderly, and disabled individuals.",
  },
  {
    title: "Homeowner Repair & Rehabilitation Grants",
    description:
      "USDA, HUD, and state programs that fund critical home repairs, accessibility upgrades, and energy efficiency improvements for low-income homeowners.",
  },
  {
    title: "Down Payment Assistance",
    description:
      "State housing finance agency programs and nonprofit grants that help first-time homebuyers cover down payments and closing costs.",
  },
  {
    title: "Homeless Prevention Programs",
    description:
      "Continuum of Care, ESG, and local programs providing transitional housing, rapid rehousing, and homelessness prevention services.",
  },
];

export default function HousingAssistanceProgramsPage() {
  return (
    <>
      <div style={{ marginBottom: "1rem" }}>
        <Link href="/financial-help" className="detail-back">← Financial Help</Link>
      </div>

      <h1 className="page-title">Housing Assistance Programs</h1>
      <p className="page-subtitle">
        Rental help, homeowner aid, and affordable housing resources for individuals and families
      </p>

      <div className="fh-notice" style={{ marginBottom: "2rem" }}>
        <strong>Coming Soon.</strong> We are currently indexing housing assistance programs from federal, state, and
        local sources. In the meantime,{" "}
        <Link href="/grants?industry=Housing">browse housing grants</Link> already available in our database.
      </div>

      <div className="fh-section">
        <h2 className="fh-section-title">Types of Housing Assistance We Are Indexing</h2>
        <div className="fh-program-list">
          {PROGRAM_TYPES.map((p) => (
            <div key={p.title} className="fh-program-item">
              <h3>{p.title}</h3>
              <p>{p.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="fh-section">
        <h2 className="fh-section-title">Related Resources</h2>
        <div className="fh-quick-links">
          <Link href="/grants" className="fh-quick-link">Browse All Grants</Link>
          <Link href="/debt-relief-programs" className="fh-quick-link">Debt Relief Programs</Link>
          <Link href="/financial-assistance-programs" className="fh-quick-link">Financial Assistance Programs</Link>
        </div>
      </div>
    </>
  );
}
