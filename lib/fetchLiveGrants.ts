/**
 * lib/fetchLiveGrants.ts
 *
 * Fetches grants from the Cloudflare Worker in production.
 * Falls back directly to the Grants.gov REST API if the Worker is unreachable.
 * Returns an empty array on total failure — never crashes.
 *
 * ROLLBACK: to revert to static JSON, uncomment the two lines below and
 * replace the Grants.gov calls in getLiveGrants / getLiveGrantsPage with
 * the sliceStaticPage helper at the bottom of this file.
 *
 * Usage in any Server Component or generateStaticParams:
 *
 *   import { getLiveGrants, getLiveGrantsPage } from "@/lib/fetchLiveGrants";
 *
 *   // Full list (first page from Grants.gov, ~20 grants)
 *   const grants = await getLiveGrants();
 *
 *   // Paginated — fetches one page at a time
 *   const { grants, total, page, totalPages } = await getLiveGrantsPage(1);
 */

import type { Grant } from "@/lib/grants";
// import staticGrantsData from "@/data/grants.json";   // ROLLBACK: uncomment to restore static data
// const STATIC_GRANTS = staticGrantsData as Grant[];    // ROLLBACK: uncomment to restore static data

const WORKER_URL = process.env.GRANTS_WORKER_URL ?? "";
const PAGE_SIZE = 20;

const GRANTS_GOV_URL =
  "https://apply07.grants.gov/grantsws/rest/opportunities/search/";

export interface GrantsPage {
  grants: Grant[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
}

// ── Grants.gov API types ────────────────────────────────────────────────────

interface GovEligibility {
  code: string;
  description: string;
}

interface GovOpportunity {
  id: number;
  number: string;
  title: string;
  agencyCode: string;
  agencyName: string;
  openDate: string;   // MMDDYYYY
  closeDate: string;  // MMDDYYYY
  oppStatus: string;
  awardCeiling: number;
  awardFloor: number;
  synopsis: string;
  description?: string;
  eligibilities: GovEligibility[];
  cfdaNumbers: string[];
}

interface GovSearchResponse {
  hitCount: number;
  oppHits: GovOpportunity[];
}

// ── Mapping helpers ─────────────────────────────────────────────────────────

/** Converts MM/DD/YYYY or MMDDYYYY → YYYY-MM-DD */
function parseGovDate(raw: string): string {
  if (!raw) return "";
  // API returns MM/DD/YYYY (e.g. "05/08/2026")
  const slashMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slashMatch) return `${slashMatch[3]}-${slashMatch[1]}-${slashMatch[2]}`;
  // Legacy MMDDYYYY fallback
  if (raw.length >= 8) {
    const mm = raw.slice(0, 2);
    const dd = raw.slice(2, 4);
    const yyyy = raw.slice(4, 8);
    return `${yyyy}-${mm}-${dd}`;
  }
  return "";
}

/** Derives industry tags from the agency name */
function agencyToTags(agencyName: string | undefined | null): string[] {
  if (!agencyName) return ["Federal"];
  const n = agencyName.toLowerCase();
  const tags: string[] = [];
  if (n.includes("agriculture") || n.includes("rural")) tags.push("Agriculture");
  if (n.includes("health") || n.includes("human services")) tags.push("Healthcare");
  if (n.includes("education")) tags.push("Education");
  if (n.includes("energy")) tags.push("Energy");
  if (n.includes("environment") || n.includes("epa")) tags.push("Environment");
  if (n.includes("housing") || n.includes("urban development")) tags.push("Housing");
  if (n.includes("labor") || n.includes("workforce")) tags.push("Workforce Development");
  if (n.includes("small business")) tags.push("Small Business");
  if (n.includes("transportation")) tags.push("Transportation");
  if (n.includes("defense") || n.includes("army") || n.includes("navy") || n.includes("air force")) tags.push("Defense");
  if (n.includes("commerce")) tags.push("Economic Development");
  if (n.includes("justice")) tags.push("Public Safety");
  if (n.includes("interior")) tags.push("Conservation");
  if (n.includes("arts") || n.includes("humanities")) tags.push("Arts");
  if (n.includes("science") || n.includes("research")) tags.push("Research");
  if (n.includes("technology") || n.includes("innovation")) tags.push("Technology");
  if (tags.length === 0) tags.push("Federal");
  return tags;
}

/** Maps a Grants.gov opportunity to the app's Grant shape */
function mapOpportunity(opp: GovOpportunity): Grant {
  const funding =
    (opp.awardCeiling ?? 0) > 0 ? opp.awardCeiling : (opp.awardFloor ?? 0);
  const eligibility =
    Array.isArray(opp.eligibilities) && opp.eligibilities.length > 0
      ? opp.eligibilities.map((e) => e.description).filter(Boolean).join(", ")
      : "See official grant page for eligibility requirements";

  return {
    id: (opp.id ?? opp.number ?? "0").toString(),
    title: opp.title ?? "Untitled Grant",
    funding_amount: funding ?? 0,
    deadline: parseGovDate(opp.closeDate ?? ""),
    eligibility,
    industry_tags: agencyToTags(opp.agencyName),
    location: "Nationwide",
    description:
      opp.synopsis || opp.description || "See official grant page for details.",
    source_url: `https://www.grants.gov/search-results-detail/${opp.id}`,
    programType: "grant",
  };
}

// ── Core Grants.gov fetch ───────────────────────────────────────────────────

async function fetchFromGrantsGov(page: number): Promise<GrantsPage> {
  const safePage = Math.max(1, page);
  const startRecordNum = (safePage - 1) * PAGE_SIZE;

  const res = await fetch(GRANTS_GOV_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      keyword: "",
      oppStatuses: "posted",
      rows: PAGE_SIZE,
      startRecordNum,
    }),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Grants.gov API returned ${res.status}`);
  }

  const data: GovSearchResponse = await res.json();
  const grants = (data.oppHits ?? []).map(mapOpportunity);
  const total = data.hitCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  console.log(
    `[grants.gov] Page ${safePage}/${totalPages} — ${grants.length} grants (${total} total)`
  );

  return { grants, total, page: safePage, totalPages, pageSize: PAGE_SIZE };
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns ALL grants (first page) — suitable for small datasets or sitemaps.
 * Uses Worker if configured, otherwise falls back to Grants.gov API.
 */
export async function getLiveGrants(): Promise<Grant[]> {
  if (WORKER_URL) {
    try {
      const res = await fetch(`${WORKER_URL}/grants`, {
        next: { revalidate: 86400 },
      });
      if (res.ok) {
        const grants: Grant[] = await res.json();
        console.log(`[grants] Loaded ${grants.length} grants from Worker`);
        return grants;
      }
      console.warn(`[grants] Worker returned ${res.status} — falling back to Grants.gov`);
    } catch (err) {
      console.warn("[grants] Worker fetch failed — falling back to Grants.gov:", err);
    }
  }

  try {
    const { grants } = await fetchFromGrantsGov(1);
    return grants;
  } catch (err) {
    console.error("[grants] Grants.gov fetch failed, returning empty list:", err);
    return [];
  }
}

/**
 * Fetches a single paginated page of grants.
 * Uses Worker if configured, otherwise falls back to Grants.gov API.
 * Returns an empty page on total failure.
 */
export async function getLiveGrantsPage(page: number): Promise<GrantsPage> {
  const safePage = Math.max(1, page);

  if (WORKER_URL) {
    try {
      const res = await fetch(`${WORKER_URL}/grants?page=${safePage}`, {
        next: { revalidate: 86400 },
      });
      if (res.ok) {
        const data: GrantsPage = await res.json();
        console.log(
          `[grants] Page ${data.page}/${data.totalPages} — ${data.grants.length} grants (${data.total} total)`
        );
        return data;
      }
      console.warn(`[grants] Worker returned ${res.status} — falling back to Grants.gov`);
    } catch (err) {
      console.warn("[grants] Worker fetch failed — falling back to Grants.gov:", err);
    }
  }

  try {
    return await fetchFromGrantsGov(safePage);
  } catch (err) {
    console.error("[grants] Grants.gov fetch failed, returning empty page:", err);
    return { grants: [], total: 0, page: safePage, totalPages: 1, pageSize: PAGE_SIZE };
  }
}

/**
 * Fetch Worker status — useful for an admin dashboard or health check.
 */
export async function getWorkerStatus(): Promise<{
  grants_count: string | null;
  last_updated: string | null;
} | null> {
  if (!WORKER_URL) return null;
  try {
    const res = await fetch(`${WORKER_URL}/status`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
