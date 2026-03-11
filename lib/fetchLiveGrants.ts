/**
 * lib/fetchLiveGrants.ts
 *
 * Fetches grants from the Cloudflare Worker in production.
 * Falls back to the local grants.json if the Worker is unreachable.
 *
 * Usage in any Server Component or generateStaticParams:
 *
 *   import { getLiveGrants } from "@/lib/fetchLiveGrants";
 *   const grants = await getLiveGrants();
 */

import type { Grant } from "@/lib/grants";
import staticGrantsData from "@/data/grants.json";

const WORKER_URL = process.env.GRANTS_WORKER_URL ?? "";

/**
 * Returns grants from the Cloudflare Worker if configured,
 * otherwise falls back to the bundled static JSON.
 *
 * The result is cached for 24 hours via Next.js fetch cache.
 */
export async function getLiveGrants(): Promise<Grant[]> {
  // If no Worker URL is configured, use static data (dev / initial deploy)
  if (!WORKER_URL) {
    console.log("[grants] No GRANTS_WORKER_URL set — using static grants.json");
    return staticGrantsData as Grant[];
  }

  try {
    const res = await fetch(`${WORKER_URL}/grants`, {
      // Next.js 14+ cache: revalidate once per day
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      console.warn(`[grants] Worker returned ${res.status} — falling back to static data`);
      return staticGrantsData as Grant[];
    }

    const grants: Grant[] = await res.json();
    console.log(`[grants] Loaded ${grants.length} grants from Worker`);
    return grants;
  } catch (err) {
    console.warn("[grants] Worker fetch failed — falling back to static data:", err);
    return staticGrantsData as Grant[];
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
