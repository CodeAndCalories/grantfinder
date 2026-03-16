export const dynamic = "force-dynamic";
export const runtime = "edge";

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getUniqueLocations,
  getUniqueIndustries,
  formatCurrency,
} from "@/lib/grants";
import { getLiveGrantsPage } from "@/lib/fetchLiveGrants";
import GrantCard from "@/components/GrantCard";

// ---------------------------------------------------------------------------
// Slug helpers — must match sitemap and sibling pages exactly
// ---------------------------------------------------------------------------
function toSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function stateFromSlug(slug: string): string | undefined {
  return getUniqueLocations().find((l) => toSlug(l) === slug);
}

function industryFromSlug(slug: string): string | undefined {
  return getUniqueIndustries().find((i) => toSlug(i) === slug);
}

// ---------------------------------------------------------------------------
// SEO metadata
// ---------------------------------------------------------------------------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string; industry: string }>;
}): Promise<Metadata> {
  const { state: stateSlug, industry: industrySlug } = await params;
  const state = stateFromSlug(stateSlug);
  const industry = industryFromSlug(industrySlug);
  if (!state || !industry) return { title: "Not Found" };

  return {
    title: `${industry} Grants in ${state} | GrantLocate`,
    description: `Browse ${industry.toLowerCase()} grants available in ${state} for businesses, nonprofits, students, and research programs.`,
  };
}

// ---------------------------------------------------------------------------
// Hero gradient per broad industry bucket
// ---------------------------------------------------------------------------
const INDUSTRY_GRADIENTS: Record<string, string> = {
  Technology:        "135deg, #1e3a5f 0%, #2563eb 100%",
  Agriculture:       "135deg, #14532d 0%, #16a34a 100%",
  Healthcare:        "135deg, #1e1b4b 0%, #7c3aed 100%",
  Energy:            "135deg, #78350f 0%, #f59e0b 100%",
  "Clean Energy":    "135deg, #064e3b 0%, #059669 100%",
  Education:         "135deg, #1e3a5f 0%, #0ea5e9 100%",
  Environment:       "135deg, #14532d 0%, #65a30d 100%",
  Manufacturing:     "135deg, #1c1917 0%, #78716c 100%",
  Arts:              "135deg, #4c1d95 0%, #db2777 100%",
  Research:          "135deg, #0c4a6e 0%, #0284c7 100%",
  Housing:           "135deg, #7f1d1d 0%, #dc2626 100%",
  Transportation:    "135deg, #0f172a 0%, #475569 100%",
  Community:         "135deg, #1e3a5f 0%, #0891b2 100%",
  Innovation:        "135deg, #312e81 0%, #6366f1 100%",
  Entrepreneurship:  "135deg, #1c1917 0%, #b45309 100%",
};

function heroGradient(industry: string): string {
  return INDUSTRY_GRADIENTS[industry] ?? "135deg, #0f172a 0%, #1e40af 100%";
}

// ---------------------------------------------------------------------------
// Category intro paragraphs
// ---------------------------------------------------------------------------
const CATEGORY_INTROS: Record<string, string> = {
  Education: "Education grants provide funding for schools, teachers, nonprofits, and individuals seeking to advance learning opportunities. Federal education grants support programs ranging from early childhood development to higher education research initiatives. Whether you are a nonprofit organization improving literacy rates, a school district modernizing technology, or an individual pursuing advanced degrees, there are federal funding opportunities available. Use the listings below to find active education grants relevant to your location and goals.",
  "Small Business": "Small business grants provide non-repayable funding to entrepreneurs, startups, and growing companies. Unlike loans, grants do not require repayment, making them one of the most valuable resources for business owners. Federal small business grants often target innovation, job creation, technology development, and underserved communities. Browse the active opportunities below to find small business funding programs you may qualify for.",
  Agriculture: "Agriculture grants support farmers, ranchers, rural communities, and agricultural researchers across the United States. Federal programs through the USDA and other agencies fund initiatives including sustainable farming, rural development, food security, and agricultural technology. Whether you operate a small family farm or a large agricultural enterprise, federal funding programs may be available to support your work.",
  Healthcare: "Healthcare grants fund medical research, community health programs, clinical trials, and public health initiatives. Federal agencies including the NIH, CDC, and HRSA offer hundreds of active funding opportunities for healthcare organizations, researchers, and nonprofits. Browse current healthcare grant opportunities below.",
  Research: "Research grants support scientific investigation, academic study, and innovation across all disciplines. Federal research funding is available through agencies including the NSF, NIH, DOE, and NASA. Whether you are an independent researcher, university, or private institution, active federal research grants are listed below.",
  Energy: "Energy grants fund clean energy development, energy efficiency programs, grid modernization, and renewable energy research. Federal agencies including the Department of Energy offer significant funding for both public and private sector energy initiatives. Browse active energy grant opportunities below.",
  Community: "Community development grants support nonprofits, local governments, and organizations working to improve neighborhoods, expand services, and strengthen communities. Federal community grants fund housing, workforce development, public safety, and social services programs. Find active community grants below.",
  Environment: "Environmental grants fund conservation, climate research, pollution reduction, and natural resource management. Federal agencies including the EPA and Department of Interior offer grants for both organizations and government entities working to protect the environment. Browse active environmental grant opportunities below.",
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default async function StateIndustryPage({
  params,
}: {
  params: Promise<{ state: string; industry: string }>;
}) {
  const { state: stateSlug, industry: industrySlug } = await params;
  const state    = stateFromSlug(stateSlug);
  const industry = industryFromSlug(industrySlug);
  if (!state || !industry) notFound();

  // Fetch live grants and filter by state + industry tag
  const liveData = await getLiveGrantsPage(1);
  const allGrants = liveData.grants;

  const grants = allGrants.filter(
    (g) =>
      g.location === state &&
      g.industry_tags.some((t) => toSlug(t) === industrySlug)
  );

  const totalFunding = grants.reduce((sum, g) => sum + (g.funding_amount ?? 0), 0);
  const avgFunding   = grants.length > 0 ? Math.round(totalFunding / grants.length) : 0;

  // Category intro
  const categoryIntro = CATEGORY_INTROS[industry] ??
    `Browse active federal grant opportunities for ${industry} in ${state}. These listings are sourced directly from Grants.gov and updated regularly.`;

  // Related industries available in this state (excluding current)
  const relatedIndustries = Array.from(
    new Set(grants.flatMap((g) => g.industry_tags))
  )
    .filter((t) => toSlug(t) !== industrySlug)
    .sort();

  // Other states that have grants in this industry
  const otherStates = Array.from(
    new Set(
      allGrants
        .filter(
          (g) =>
            g.location !== state &&
            g.industry_tags.some((t) => toSlug(t) === industrySlug)
        )
        .map((g) => g.location)
    )
  ).sort();

  return (
    <>
      {/* Breadcrumb */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          fontSize: "0.85rem",
          marginBottom: "1.25rem",
          opacity: 0.7,
          flexWrap: "wrap",
        }}
      >
        <Link href="/grants" style={{ textDecoration: "none", color: "inherit" }}>
          All Grants
        </Link>
        <span>›</span>
        <Link
          href={`/grants/state/${stateSlug}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {state}
        </Link>
        <span>›</span>
        <Link
          href={`/grants/${industrySlug}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {industry}
        </Link>
        <span>›</span>
        <span style={{ opacity: 0.5 }}>
          {industry} in {state}
        </span>
      </nav>

      {/* Hero */}
      <div
        style={{
          background: `linear-gradient(${heroGradient(industry)})`,
          borderRadius: "1rem",
          padding: "2.5rem 2rem",
          marginBottom: "2rem",
          color: "#fff",
        }}
      >
        <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 0.6rem" }}>
          {industry} Grants in {state}
        </h1>
        <p style={{ maxWidth: "600px", opacity: 0.9, margin: "0 0 1.5rem", lineHeight: 1.6 }}>
          {categoryIntro}
        </p>

        {/* Stat pills */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {[
            { value: grants.length,               label: "Grants Available" },
            { value: formatCurrency(avgFunding),   label: "Avg. Award"       },
            { value: formatCurrency(totalFunding), label: "Total Funding"    },
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

      {/* Results count */}
      <div className="results-bar" style={{ marginBottom: "1rem" }}>
        <span className="results-count">
          {grants.length} {grants.length === 1 ? "grant" : "grants"} found
        </span>
      </div>

      {/* Grant cards */}
      {grants.length === 0 ? (
        <div className="empty-state">
          <h2>No grants found</h2>
          <p>
            Try browsing{" "}
            <Link href={`/grants/state/${stateSlug}`}>all {state} grants</Link> or{" "}
            <Link href={`/grants/${industrySlug}`}>all {industry} grants</Link>.
          </p>
        </div>
      ) : (
        <div className="grants-list">
          {grants.map((grant) => (
            <GrantCard key={grant.id} grant={grant} />
          ))}
        </div>
      )}

      {/* Related panels */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          marginTop: "3rem",
          paddingTop: "2rem",
          borderTop: "1px solid var(--border, #e2e8f0)",
        }}
      >
        {/* More industries in this state */}
        {relatedIndustries.length > 0 && (
          <div>
            <h2 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem" }}>
              More Industries in {state}
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {relatedIndustries.map((tag) => (
                <Link
                  key={tag}
                  href={`/grants/state/${stateSlug}/${toSlug(tag)}`}
                  className="tag"
                  style={{ textDecoration: "none" }}
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Same industry in other states */}
        {otherStates.length > 0 && (
          <div>
            <h2 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem" }}>
              {industry} Grants in Other States
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {otherStates.map((s) => (
                <Link
                  key={s}
                  href={`/grants/state/${toSlug(s)}/${industrySlug}`}
                  className="tag"
                  style={{ textDecoration: "none" }}
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
