import type { Metadata } from "next";
import Link from "next/link";
import { getAllGrants, formatCurrency } from "@/lib/grants";

export const metadata: Metadata = {
  title: "Financial Help Programs | GrantLocate",
  description:
    "Find grants, relief funds, assistance programs, and hardship support for individuals, businesses, and nonprofits across the United States.",
};

// ── Static program data ────────────────────────────────────────────────────

const RELIEF_FUNDS = [
  {
    title: "FEMA Individual Assistance Program",
    description: "Federal disaster relief for individuals and households affected by presidentially declared disasters, covering housing and essential needs.",
    tags: ["Disaster Relief", "Federal"],
    href: "https://www.fema.gov/assistance/individual",
  },
  {
    title: "American Red Cross Emergency Financial Assistance",
    description: "Short-term financial help for families displaced by home fires and other disasters, including emergency food, shelter, and clothing.",
    tags: ["Emergency", "Nonprofit"],
    href: "https://www.redcross.org/get-help/disaster-relief-and-recovery-services/financial-assistance.html",
  },
  {
    title: "SBA Economic Injury Disaster Loans (EIDL)",
    description: "Low-interest federal loans for small businesses, nonprofits, and agricultural cooperatives that suffer substantial economic injury from declared disasters.",
    tags: ["Small Business", "Disaster Relief"],
    href: "https://www.sba.gov/funding-programs/loans/covid-eidl",
  },
  {
    title: "USDA Emergency Food Assistance Program",
    description: "Provides nutritious food to low-income Americans through local food banks and food pantries, including during times of disaster or hardship.",
    tags: ["Food", "Federal"],
    href: "https://www.fns.usda.gov/tefap/emergency-food-assistance-program",
  },
  {
    title: "State Emergency Relief Programs",
    description: "Each US state operates emergency relief programs for residents facing crisis situations. Contact your state's Department of Social Services for local options.",
    tags: ["State", "Emergency"],
    href: "https://www.benefits.gov",
  },
  {
    title: "Salvation Army Emergency Disaster Relief",
    description: "Immediate financial and material assistance for individuals and families in the aftermath of disasters, including food, water, shelter, and emotional support.",
    tags: ["Nonprofit", "Emergency"],
    href: "https://www.salvationarmyusa.org/usn/provide-disaster-relief",
  },
  {
    title: "Community Foundation Rapid Response Grants",
    description: "Local community foundations often maintain rapid response funds to deploy emergency grants to nonprofits and individuals during community crises.",
    tags: ["Community", "Emergency"],
    href: "https://www.cof.org",
  },
];

const ASSISTANCE_PROGRAMS = [
  {
    title: "HUD Housing Choice Voucher Program (Section 8)",
    description: "Federal rental assistance program that helps low-income families, elderly, and disabled individuals afford safe housing in the private market.",
    tags: ["Housing", "Federal"],
    href: "https://www.hud.gov/topics/housing_choice_voucher_program_section_8",
  },
  {
    title: "Low Income Home Energy Assistance Program (LIHEAP)",
    description: "Federally funded program that helps low-income households pay for home heating and cooling energy costs, bill payment assistance, and weatherization.",
    tags: ["Utility", "Federal"],
    href: "https://www.acf.hhs.gov/ocs/programs/liheap",
  },
  {
    title: "Supplemental Nutrition Assistance Program (SNAP)",
    description: "Provides monthly food benefits to eligible low-income individuals and families, helping them afford a nutritious diet through EBT cards accepted at grocery stores.",
    tags: ["Food", "Federal"],
    href: "https://www.fns.usda.gov/snap/supplemental-nutrition-assistance-program",
  },
  {
    title: "Medicaid Health Coverage",
    description: "Joint federal-state program providing free or low-cost health coverage to millions of Americans including low-income adults, children, pregnant women, and people with disabilities.",
    tags: ["Healthcare", "Federal"],
    href: "https://www.medicaid.gov",
  },
  {
    title: "Emergency Rental Assistance Program (ERAP)",
    description: "Helps renters who cannot afford rent or utilities due to financial hardship. Many states and local governments administer their own ERAP with federal funding.",
    tags: ["Housing", "Rental"],
    href: "https://home.treasury.gov/policy-issues/coronavirus/assistance-for-state-local-and-tribal-governments/emergency-rental-assistance-program",
  },
  {
    title: "WIC — Women, Infants, and Children",
    description: "Provides nutrition assistance, healthy food, and health care referrals to low-income pregnant women, new mothers, infants, and children under age 5.",
    tags: ["Food", "Healthcare"],
    href: "https://www.fns.usda.gov/wic",
  },
  {
    title: "Lifeline Phone & Internet Assistance",
    description: "FCC program that discounts monthly phone and broadband service for eligible low-income households, ensuring connectivity for work, school, and healthcare.",
    tags: ["Utility", "Federal"],
    href: "https://www.lifelineprogramforamericans.com",
  },
  {
    title: "USDA Rural Housing Repair Grants",
    description: "Grants and loans to help very low-income rural homeowners repair, improve, or modernize their homes and remove health and safety hazards.",
    tags: ["Housing", "Rural"],
    href: "https://www.rd.usda.gov/programs-services/single-family-housing-programs/single-family-housing-repair-loans-grants",
  },
];

const HARDSHIP_SUPPORT = [
  {
    title: "NFCC Nonprofit Credit Counseling",
    description: "Free and low-cost financial counseling through nonprofit agencies to help individuals manage debt, create budgets, and avoid bankruptcy.",
    tags: ["Debt Relief", "Counseling"],
    href: "https://www.nfcc.org",
  },
  {
    title: "Student Loan Income-Driven Repayment Plans",
    description: "Federal programs that cap monthly student loan payments at a percentage of income, with loan forgiveness after 10–25 years of qualifying payments.",
    tags: ["Debt Relief", "Education"],
    href: "https://studentaid.gov/manage-loans/repayment/plans/income-driven",
  },
  {
    title: "Public Service Loan Forgiveness (PSLF)",
    description: "Forgives remaining student loan balances for borrowers who work full-time for qualifying government or nonprofit employers and make 120 qualifying payments.",
    tags: ["Debt Relief", "Federal"],
    href: "https://studentaid.gov/manage-loans/forgiveness-cancellation/public-service",
  },
  {
    title: "United Way 211 Financial Assistance",
    description: "Call or text 211 to connect with local financial assistance programs in your area, including emergency funds, rent help, food assistance, and utility aid.",
    tags: ["Community", "Emergency"],
    href: "https://www.211.org",
  },
  {
    title: "Legal Aid Society Debt Defense",
    description: "Free legal services to help low-income individuals fight debt collection lawsuits, wage garnishment, and predatory lending practices.",
    tags: ["Legal", "Debt Relief"],
    href: "https://www.legalaidatwork.org",
  },
  {
    title: "SBA Small Business Debt Relief Program",
    description: "Provides payment relief for small businesses with existing SBA loans, covering principal, interest, and fees for a period of time to ease financial burdens.",
    tags: ["Small Business", "Debt Relief"],
    href: "https://www.sba.gov/funding-programs/loans/covid-eidl/sba-debt-relief",
  },
  {
    title: "Homeowner Assistance Fund (HAF)",
    description: "Federally funded program to help homeowners affected by COVID-19 with mortgage payments, property taxes, utility bills, and other housing-related costs.",
    tags: ["Housing", "Federal"],
    href: "https://home.treasury.gov/policy-issues/coronavirus/assistance-for-homeowners/homeowner-assistance-fund",
  },
  {
    title: "Veterans Financial Assistance Programs",
    description: "VA financial assistance programs for veterans facing hardship, including pension benefits, special compensation, and emergency funds through veteran service organizations.",
    tags: ["Veterans", "Federal"],
    href: "https://www.va.gov/pension",
  },
];

// ── Top 20 states for state grid ──────────────────────────────────────────

const TOP_STATES = [
  { name: "California",      slug: "california" },
  { name: "Texas",           slug: "texas" },
  { name: "New York",        slug: "new-york" },
  { name: "Florida",         slug: "florida" },
  { name: "Illinois",        slug: "illinois" },
  { name: "Pennsylvania",    slug: "pennsylvania" },
  { name: "Ohio",            slug: "ohio" },
  { name: "Michigan",        slug: "michigan" },
  { name: "Georgia",         slug: "georgia" },
  { name: "North Carolina",  slug: "north-carolina" },
  { name: "Washington",      slug: "washington" },
  { name: "Colorado",        slug: "colorado" },
  { name: "Arizona",         slug: "arizona" },
  { name: "Massachusetts",   slug: "massachusetts" },
  { name: "Oregon",          slug: "oregon" },
  { name: "Minnesota",       slug: "minnesota" },
  { name: "Wisconsin",       slug: "wisconsin" },
  { name: "Maryland",        slug: "maryland" },
  { name: "Nevada",          slug: "nevada" },
  { name: "Tennessee",       slug: "tennessee" },
];

const QUICK_LINKS = [
  { label: "Debt Relief Programs",         href: "/debt-relief-programs" },
  { label: "Housing Assistance",           href: "/housing-assistance-programs" },
  { label: "Small Business Grants",        href: "/small-business-grants" },
  { label: "Financial Assistance Programs",href: "/financial-assistance-programs" },
];

export default function FinancialHelpPage() {
  const allGrants = getAllGrants();
  const grantCount = allGrants.length;

  // Latest 5 grants (highest id = newest)
  const latestGrants = [...allGrants]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5);

  return (
    <>
      <h1 className="page-title">Financial Help Programs</h1>
      <p className="page-subtitle">
        Discover grants, relief funds, and financial assistance programs across the United States
      </p>

      {/* ── Category overview cards ─────────────────────────────────── */}
      <div className="fh-grid" style={{ marginBottom: "2.5rem" }}>
        {[
          { icon: "🏛️", label: "Grants", count: grantCount, href: "/grants", desc: "Government and foundation grants for businesses, nonprofits, research, and community projects." },
          { icon: "🤝", label: "Relief Funds", count: RELIEF_FUNDS.length, href: "#relief-funds", desc: "Emergency and disaster relief funds for individuals, families, and businesses facing hardship." },
          { icon: "🏠", label: "Assistance Programs", count: ASSISTANCE_PROGRAMS.length, href: "#assistance-programs", desc: "Housing, utility, food, and other assistance programs for qualifying households." },
          { icon: "💙", label: "Hardship Support", count: HARDSHIP_SUPPORT.length, href: "#hardship-support", desc: "Debt relief, financial counseling, and support programs for those in financial difficulty." },
        ].map((cat) => (
          <a key={cat.label} href={cat.href} className="fh-card fh-card--active" style={{ textDecoration: "none" }}>
            <div className="fh-card-icon">{cat.icon}</div>
            <h2 className="fh-card-title">{cat.label}</h2>
            <p className="fh-card-desc">{cat.desc}</p>
            <span className="fh-card-link">Browse {cat.count} {cat.label} →</span>
          </a>
        ))}
      </div>

      {/* ── Relief Funds ─────────────────────────────────────────────── */}
      <section id="relief-funds" className="fh-section">
        <h2 className="fh-section-title">🤝 Relief Funds</h2>
        <p className="fh-section-subtitle">Emergency and disaster relief for individuals and businesses</p>
        <div className="fh-program-list">
          {RELIEF_FUNDS.map((p) => (
            <a key={p.title} href={p.href} target="_blank" rel="noopener noreferrer" className="fh-program-item fh-program-link">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                <h3>{p.title}</h3>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", whiteSpace: "nowrap" }}>↗ Official Site</span>
              </div>
              <p>{p.description}</p>
              <div className="fh-program-tags">
                {p.tags.map((t) => <span key={t} className="fh-program-tag">{t}</span>)}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Assistance Programs ──────────────────────────────────────── */}
      <section id="assistance-programs" className="fh-section">
        <h2 className="fh-section-title">🏠 Assistance Programs</h2>
        <p className="fh-section-subtitle">Housing, utility, food, and healthcare assistance for qualifying households</p>
        <div className="fh-program-list">
          {ASSISTANCE_PROGRAMS.map((p) => (
            <a key={p.title} href={p.href} target="_blank" rel="noopener noreferrer" className="fh-program-item fh-program-link">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                <h3>{p.title}</h3>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", whiteSpace: "nowrap" }}>↗ Official Site</span>
              </div>
              <p>{p.description}</p>
              <div className="fh-program-tags">
                {p.tags.map((t) => <span key={t} className="fh-program-tag">{t}</span>)}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Hardship Support ─────────────────────────────────────────── */}
      <section id="hardship-support" className="fh-section">
        <h2 className="fh-section-title">💙 Hardship Support</h2>
        <p className="fh-section-subtitle">Debt relief, counseling, and financial recovery programs</p>
        <div className="fh-program-list">
          {HARDSHIP_SUPPORT.map((p) => (
            <a key={p.title} href={p.href} target="_blank" rel="noopener noreferrer" className="fh-program-item fh-program-link">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                <h3>{p.title}</h3>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", whiteSpace: "nowrap" }}>↗ Official Site</span>
              </div>
              <p>{p.description}</p>
              <div className="fh-program-tags">
                {p.tags.map((t) => <span key={t} className="fh-program-tag">{t}</span>)}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Browse by State ──────────────────────────────────────────── */}
      <section className="fh-section">
        <h2 className="fh-section-title">📍 Browse Grants by State</h2>
        <p className="fh-section-subtitle">Find grants available in your state</p>
        <div className="state-grid">
          {TOP_STATES.map((s) => (
            <Link key={s.slug} href={`/grants/state/${s.slug}`} className="state-grid-item">
              {s.name}
            </Link>
          ))}
          <Link href="/grants" className="state-grid-item state-grid-item--all">
            All States →
          </Link>
        </div>
      </section>

      {/* ── Latest Grants Added ──────────────────────────────────────── */}
      <section className="fh-section">
        <h2 className="fh-section-title">🆕 Latest Grants Added</h2>
        <p className="fh-section-subtitle">Recently indexed grants — check back often for new listings</p>
        <div className="fh-program-list">
          {latestGrants.map((g) => (
            <Link key={g.id} href={`/grants/${g.id}`} className="fh-program-item fh-program-link" style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                <h3 style={{ fontSize: "0.92rem" }}>{g.title}</h3>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", whiteSpace: "nowrap" }}>
                  {formatCurrency(g.funding_amount)}
                </span>
              </div>
              <p style={{ fontSize: "0.82rem" }}>{g.location} · Deadline {new Date(g.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
              <div className="fh-program-tags">
                {g.industry_tags.slice(0, 3).map((t) => <span key={t} className="fh-program-tag">{t}</span>)}
              </div>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: "1rem" }}>
          <Link href="/grants" className="fh-quick-link">View all {grantCount} grants →</Link>
        </div>
      </section>

      {/* ── Quick links ──────────────────────────────────────────────── */}
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
    </>
  );
}
