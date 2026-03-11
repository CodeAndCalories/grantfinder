import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllGrants, getUniqueLocations, formatCurrency } from "@/lib/grants";
import GrantCard from "@/components/GrantCard";

// ---------------------------------------------------------------------------
// Slug helpers
// ---------------------------------------------------------------------------
function toSlug(state: string): string {
  return state.toLowerCase().replace(/\s+/g, "-");
}

function fromSlug(slug: string): string | undefined {
  return getUniqueLocations().find((l) => toSlug(l) === slug);
}

// ---------------------------------------------------------------------------
// Static params — pre-render a page for every unique location
// ---------------------------------------------------------------------------
export function generateStaticParams() {
  return getUniqueLocations().map((state) => ({ state: toSlug(state) }));
}

// ---------------------------------------------------------------------------
// SEO metadata
// ---------------------------------------------------------------------------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state: slug } = await params;
  const state = fromSlug(slug);
  if (!state) return { title: "State Not Found" };
  return {
    title: `Grants in ${state} | GrantLocate`,
    description: `Browse government grants available in ${state} for businesses, nonprofits, students, and research programs.`,
  };
}

// ---------------------------------------------------------------------------
// State facts for richer page context
// ---------------------------------------------------------------------------
const STATE_FACTS: Record<string, { icon: string; intro: string }> = {
  Alabama: { icon: "🌲", intro: "Alabama offers grants focused on manufacturing, rural development, and workforce training." },
  Alaska: { icon: "🏔️", intro: "Alaska's grant programs prioritize energy independence, fisheries, and tribal community development." },
  Arizona: { icon: "🌵", intro: "Arizona funds innovation, clean energy, and small business growth across its fast-growing economy." },
  Arkansas: { icon: "🌾", intro: "Arkansas grant programs support agriculture, rural infrastructure, and workforce development." },
  California: { icon: "☀️", intro: "California leads the nation in clean energy, technology, and arts funding programs." },
  Colorado: { icon: "⛰️", intro: "Colorado invests in advanced industries, outdoor recreation, and clean energy innovation." },
  Connecticut: { icon: "🏭", intro: "Connecticut funds manufacturing modernization, biotech research, and workforce training." },
  Delaware: { icon: "🦅", intro: "Delaware supports small business growth, technology startups, and community development." },
  Florida: { icon: "🌴", intro: "Florida grants span tourism, technology, agriculture, and environmental conservation." },
  Georgia: { icon: "🍑", intro: "Georgia invests in workforce development, rural broadband, and small business expansion." },
  Hawaii: { icon: "🌺", intro: "Hawaii focuses grant funding on renewable energy, conservation, and cultural preservation." },
  Idaho: { icon: "🥔", intro: "Idaho offers grants for agriculture, technology, and rural community infrastructure." },
  Illinois: { icon: "🏙️", intro: "Illinois funds clean energy, manufacturing, and community development across the state." },
  Indiana: { icon: "🌽", intro: "Indiana supports advanced manufacturing, agribusiness, and workforce skills programs." },
  Iowa: { icon: "🌻", intro: "Iowa's grants prioritize renewable energy, agricultural innovation, and rural development." },
  Kansas: { icon: "🌾", intro: "Kansas funds agriculture, aerospace, and rural broadband expansion programs." },
  Kentucky: { icon: "🐎", intro: "Kentucky invests in workforce training, tourism, and agricultural development grants." },
  Louisiana: { icon: "🎷", intro: "Louisiana supports energy, arts, tourism, and coastal restoration grant programs." },
  Maine: { icon: "🦞", intro: "Maine grants focus on fisheries, forestry, marine research, and rural development." },
  Maryland: { icon: "🦀", intro: "Maryland funds cybersecurity, biotech, and small business innovation programs." },
  Massachusetts: { icon: "🦃", intro: "Massachusetts leads in life sciences, clean energy, and innovation ecosystem grants." },
  Michigan: { icon: "🚗", intro: "Michigan invests in advanced manufacturing, mobility technology, and rural development." },
  Minnesota: { icon: "🌊", intro: "Minnesota funds clean energy, agriculture, arts, and rural community programs." },
  Mississippi: { icon: "🎸", intro: "Mississippi supports agriculture, workforce development, and rural infrastructure grants." },
  Missouri: { icon: "🌉", intro: "Missouri funds manufacturing, agriculture, and small business development programs." },
  Montana: { icon: "🦌", intro: "Montana invests in agriculture, natural resources, and rural community development." },
  Nebraska: { icon: "🌽", intro: "Nebraska's grants support agriculture, rural broadband, and workforce development." },
  Nevada: { icon: "🎰", intro: "Nevada funds tourism recovery, renewable energy, and technology startup programs." },
  "New Hampshire": { icon: "🍁", intro: "New Hampshire supports manufacturing, tourism, and workforce training grants." },
  "New Jersey": { icon: "🏖️", intro: "New Jersey funds technology startups, clean energy, and economic development programs." },
  "New Mexico": { icon: "🌶️", intro: "New Mexico invests in renewable energy, tribal development, and STEM education grants." },
  "New York": { icon: "🗽", intro: "New York leads in arts funding, technology innovation, and community development programs." },
  "North Carolina": { icon: "🌿", intro: "North Carolina supports agriculture, technology, and rural community development grants." },
  "North Dakota": { icon: "🌾", intro: "North Dakota funds agriculture, energy, and rural infrastructure programs." },
  Ohio: { icon: "🏗️", intro: "Ohio invests in manufacturing, technology, and workforce development programs." },
  Oklahoma: { icon: "🌪️", intro: "Oklahoma funds energy, agriculture, and rural community development grants." },
  Oregon: { icon: "🌲", intro: "Oregon supports clean energy, forestry, and small business innovation programs." },
  Pennsylvania: { icon: "🔔", intro: "Pennsylvania funds manufacturing, energy, and community development programs." },
  "Rhode Island": { icon: "⚓", intro: "Rhode Island supports technology, marine industries, and economic development grants." },
  "South Carolina": { icon: "🌊", intro: "South Carolina invests in manufacturing, tourism, and rural development programs." },
  "South Dakota": { icon: "🦅", intro: "South Dakota funds agriculture, tourism, and rural infrastructure grants." },
  Tennessee: { icon: "🎸", intro: "Tennessee supports manufacturing, music industry, and rural development programs." },
  Texas: { icon: "⭐", intro: "Texas funds clean energy, technology, agriculture, and small business growth programs." },
  Utah: { icon: "🏜️", intro: "Utah invests in technology startups, outdoor recreation, and rural development grants." },
  Vermont: { icon: "🍂", intro: "Vermont funds sustainable agriculture, clean energy, and arts programs." },
  Virginia: { icon: "🏛️", intro: "Virginia supports technology, defense contracting, and workforce development grants." },
  Washington: { icon: "🌲", intro: "Washington invests in clean technology, aerospace, and rural broadband programs." },
  "West Virginia": { icon: "⛏️", intro: "West Virginia funds energy transition, workforce retraining, and rural development." },
  Wisconsin: { icon: "🧀", intro: "Wisconsin supports manufacturing, agriculture, and workforce development programs." },
  Wyoming: { icon: "🤠", intro: "Wyoming funds energy, agriculture, and rural community infrastructure grants." },
  National: { icon: "🇺🇸", intro: "National programs are open to applicants across all US states and territories." },
};

function getStateFact(state: string) {
  return (
    STATE_FACTS[state] ?? {
      icon: "📍",
      intro: `Browse government grants available in ${state} for businesses, nonprofits, students, and research programs.`,
    }
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default async function StateGrantsPage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state: slug } = await params;
  const state = fromSlug(slug);
  if (!state) notFound();

  const grants = getAllGrants().filter((g) => g.location === state);
  const fact = getStateFact(state);

  const totalFunding = grants.reduce((sum, g) => sum + g.funding_amount, 0);
  const avgFunding = grants.length > 0 ? Math.round(totalFunding / grants.length) : 0;

  // Industry breakdown for this state
  const tagCounts: Record<string, number> = {};
  for (const grant of grants) {
    for (const tag of grant.industry_tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Sibling state links (excluding National)
  const allLocations = getUniqueLocations().filter(
    (l) => l !== state && l !== "National"
  );

  return (
    <>
      {/* Back link */}
      <Link href="/grants" className="detail-back">
        ← Back to all grants
      </Link>

      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e40af 100%)",
          borderRadius: "1rem",
          padding: "2.5rem 2rem",
          marginBottom: "2rem",
          color: "#fff",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{fact.icon}</div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 0.75rem" }}>
          Grants in {state}
        </h1>
        <p
          style={{
            maxWidth: "600px",
            opacity: 0.9,
            margin: "0 0 1.5rem",
            lineHeight: 1.6,
          }}
        >
          {fact.intro}
        </p>

        {/* Stat pills */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {[
            { value: grants.length, label: "Grants Available" },
            { value: formatCurrency(avgFunding), label: "Avg. Award" },
            { value: formatCurrency(totalFunding), label: "Total Funding" },
          ].map(({ value, label }) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(4px)",
                borderRadius: "0.5rem",
                padding: "0.6rem 1.1rem",
              }}
            >
              <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{value}</div>
              <div
                style={{
                  fontSize: "0.72rem",
                  opacity: 0.8,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top industries for this state */}
      {topTags.length > 0 && (
        <div style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "0.85rem", fontWeight: 600, opacity: 0.55, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.6rem" }}>
            Top Industries
          </h2>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {topTags.map(([tag, count]) => (
              <span
                key={tag}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "999px",
                  background: "#f0f9ff",
                  border: "1px solid #bae6fd",
                  fontSize: "0.8rem",
                  color: "#0369a1",
                  fontWeight: 500,
                }}
              >
                {tag}
                <span
                  style={{
                    background: "#0284c7",
                    color: "#fff",
                    borderRadius: "999px",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "0 0.38rem",
                    lineHeight: "1.5",
                  }}
                >
                  {count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="results-bar" style={{ marginBottom: "1rem" }}>
        <span className="results-count">
          {grants.length} {grants.length === 1 ? "grant" : "grants"} found in {state}
        </span>
      </div>

      {/* Grant cards */}
      {grants.length === 0 ? (
        <div className="empty-state">
          <h2>No grants found for {state}</h2>
          <p>
            Try browsing{" "}
            <Link href="/grants/national">National grants</Link> or{" "}
            <Link href="/grants">all grants</Link>.
          </p>
        </div>
      ) : (
        <div className="grants-list">
          {grants.map((grant) => (
            <GrantCard key={grant.id} grant={grant} />
          ))}
        </div>
      )}

      {/* Browse other states */}
      <div
        style={{
          marginTop: "3rem",
          paddingTop: "2rem",
          borderTop: "1px solid var(--border, #e2e8f0)",
        }}
      >
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.85rem" }}>
          Browse Grants by State
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          <Link
            href="/grants/national"
            className="tag"
            style={{ textDecoration: "none", fontWeight: 600 }}
          >
            🇺🇸 National
          </Link>
          {allLocations.map((loc) => (
            <Link
              key={loc}
              href={`/grants/state/${toSlug(loc)}`}
              className="tag"
              style={{ textDecoration: "none" }}
            >
              {loc}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
