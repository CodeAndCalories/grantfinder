import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Debt Relief Programs | GrantLocate",
  description:
    "Find debt relief programs, forgiveness initiatives, and financial assistance for individuals and small businesses struggling with debt across the United States.",
};

const PROGRAM_TYPES = [
  {
    title: "Federal Student Loan Forgiveness",
    description:
      "Income-driven repayment plans, Public Service Loan Forgiveness (PSLF), and targeted relief programs offered by the US Department of Education.",
  },
  {
    title: "Small Business Debt Relief",
    description:
      "SBA debt relief programs for small business loans, including payment deferrals and loan restructuring options for qualifying businesses.",
  },
  {
    title: "State Debt Assistance Programs",
    description:
      "State-administered programs that help residents manage and reduce debt through counseling, consolidation referrals, and targeted relief funds.",
  },
  {
    title: "Nonprofit Credit Counseling",
    description:
      "Free and low-cost debt management plans offered by HUD-approved nonprofit housing and credit counseling agencies.",
  },
];

export default function DebtReliefProgramsPage() {
  return (
    <>
      <div style={{ marginBottom: "1rem" }}>
        <Link href="/financial-help" className="detail-back">← Financial Help</Link>
      </div>

      <h1 className="page-title">Debt Relief Programs</h1>
      <p className="page-subtitle">
        Federal, state, and nonprofit programs to help individuals and businesses manage debt
      </p>

      <div className="fh-notice" style={{ marginBottom: "2rem" }}>
        <strong>Coming Soon.</strong> We are currently indexing debt relief programs and will have a full searchable
        database available shortly. In the meantime,{" "}
        <Link href="/grants">browse available grants</Link> that may provide direct financial assistance.
      </div>

      <div className="fh-section">
        <h2 className="fh-section-title">Types of Debt Relief Programs We Are Indexing</h2>
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
          <Link href="/financial-assistance-programs" className="fh-quick-link">Financial Assistance Programs</Link>
          <Link href="/grants" className="fh-quick-link">Browse All Grants</Link>
          <Link href="/housing-assistance-programs" className="fh-quick-link">Housing Assistance</Link>
        </div>
      </div>
    </>
  );
}
