/**
 * lib/fetchLiveGrants.ts
 *
 * Fetches grants from the Cloudflare Worker in production.
 * Falls back to the local grants.json if the Worker is unreachable.
 *
 * Usage in any Server Component or generateStaticParams:
 *
 *   import { getLiveGrants, getLiveGrantsPage } from "@/lib/fetchLiveGrants";
 *
 *   // Full list (uses static JSON fallback, suitable for small datasets)
 *   const grants = await getLiveGrants();
 *
 *   // Paginated — only fetches one page from the Worker (20 grants)
 *   const { grants, total, page, totalPages } = await getLiveGrantsPage(1);
 */

import type { Grant } from "@/lib/grants";
import staticGrantsData from "@/data/grants.json";

const WORKER_URL = process.env.GRANTS_WORKER_URL ?? "";
const STATIC_GRANTS = staticGrantsData as Grant[];
const PAGE_SIZE = 20;

export interface GrantsPage {
  grants: Grant[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
}

/**
 * Returns ALL grants from the Cloudflare Worker if configured,
 * otherwise falls back to the bundled static JSON.
 * Cached for 24 hours via Next.js fetch cache.
 */
export async function getLiveGrants(): Promise<Grant[]> {
  if (!WORKER_URL) {
    console.log("[grants] No GRANTS_WORKER_URL set — using static grants.json");
    return STATIC_GRANTS;
  }

  try {
    const res = await fetch(`${WORKER_URL}/grants`, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      console.warn(`[grants] Worker returned ${res.status} — falling back to static data`);
      return STATIC_GRANTS;
    }

    const grants: Grant[] = await res.json();
    console.log(`[grants] Loaded ${grants.length} grants from Worker`);
    return grants;
  } catch (err) {
    console.warn("[grants] Worker fetch failed — falling back to static data:", err);
    return STATIC_GRANTS;
  }
}

/**
 * Fetches a single page of grants from the Worker (?page=N).
 * Returns only 20 grants per request — no large payload.
 * Falls back to slicing the static JSON if the Worker is unavailable.
 * Cached for 24 hours via Next.js fetch cache.
 */
export async function getLiveGrantsPage(page: number): Promise<GrantsPage> {
  const safePage = Math.max(1, page);

  if (!WORKER_URL) {
    console.log("[grants] No GRANTS_WORKER_URL set — using static grants.json (paginated)");
    return sliceStaticPage(safePage);
  }

  try {
    const res = await fetch(`${WORKER_URL}/grants?page=${safePage}`, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      console.warn(`[grants] Worker returned ${res.status} — falling back to static data`);
      return sliceStaticPage(safePage);
    }

    const data: GrantsPage = await res.json();
    console.log(`[grants] Page ${data.page}/${data.totalPages} — ${data.grants.length} grants (${data.total} total)`);
    return data;
  } catch (err) {
    console.warn("[grants] Worker fetch failed — falling back to static data:", err);
    return sliceStaticPage(safePage);
  }
}

/** Paginates the static JSON for local dev / fallback use. */
function sliceStaticPage(page: number): GrantsPage {
  const total = STATIC_GRANTS.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  return {
    grants: STATIC_GRANTS.slice(start, start + PAGE_SIZE),
    total,
    page: safePage,
    totalPages,
    pageSize: PAGE_SIZE,
  };
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
