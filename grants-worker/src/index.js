/**
 * GrantLocate — Cloudflare Worker
 *
 * What this file does, in order:
 *
 *  1. CRON  — Cloudflare triggers `scheduled()` every day at 06:00 UTC
 *  2. FETCH — Downloads the Grants.gov XML export ZIP (~30 MB)
 *  3. UNZIP — Decompresses the ZIP using DecompressionStream (built into Workers)
 *  4. PARSE — Streams the XML and pulls out every grant opportunity
 *  5. NORMALIZE — Maps raw Grants.gov fields → your Grant schema
 *  6. STORE — Writes the JSON array to Cloudflare KV under "grants_data"
 *  7. SERVE — HTTP GET /grants returns the stored JSON to your Next.js app
 *
 * Environment bindings required (set in wrangler.toml):
 *   GRANTS_KV  — KV namespace
 */

// ---------------------------------------------------------------------------
// Grants.gov field → your schema mapping
// ---------------------------------------------------------------------------
//
// Raw Grants.gov XML fields we care about:
//
//   OpportunityID          → id
//   OpportunityTitle       → title
//   AwardCeiling           → funding_amount  (max award)
//   CloseDate              → deadline        (format: MMDDYYYY → YYYY-MM-DD)
//   EligibleApplicants     → eligibility     (numeric code → human label)
//   CFDANumbers            → industry_tags   (CFDA prefix → category)
//   AgencyName             → location        ("National" for federal)
//   Description            → description
//   AdditionalInformation  → description fallback
//   OpportunityNumber      → used to build source_url

// ---------------------------------------------------------------------------
// CFDA prefix → industry tag mapping
// CFDA numbers identify the federal program area. First two digits = category.
// Full list: https://sam.gov/content/assistance-listings
// ---------------------------------------------------------------------------
const CFDA_TAGS = {
  "10": ["Agriculture", "Rural Development", "Food"],
  "11": ["Technology", "Economic Development", "Innovation"],
  "12": ["Defense", "Research", "Technology"],
  "14": ["Housing", "Community", "Economic Development"],
  "15": ["Environment", "Rural Development", "Natural Resources"],
  "16": ["Community", "Nonprofit", "Workforce Development"],
  "17": ["Workforce Development", "Small Business", "Economic Development"],
  "20": ["Transportation", "Infrastructure", "Community"],
  "21": ["Finance", "Economic Development", "Small Business"],
  "23": ["Community", "Infrastructure", "Economic Development"],
  "43": ["Research", "Science", "Aerospace"],
  "45": ["Arts", "Culture", "Nonprofit"],
  "47": ["Research", "Science", "Technology"],
  "59": ["Small Business", "Entrepreneurship", "Economic Development"],
  "64": ["Veterans", "Healthcare", "Education"],
  "66": ["Environment", "Water", "Community"],
  "81": ["Energy", "Research", "Science"],
  "84": ["Education", "Workforce Development", "Research"],
  "93": ["Healthcare", "Research", "Community"],
  "94": ["Community", "Nonprofit", "Education"],
  "97": ["Research", "Technology", "Innovation"],
};

// Eligible applicant codes from Grants.gov spec
const ELIGIBILITY_LABELS = {
  "00": "State governments",
  "01": "County governments",
  "02": "City or township governments",
  "04": "Special district governments",
  "05": "Independent school districts",
  "06": "Public and state-controlled institutions of higher education",
  "07": "Native American tribal governments",
  "08": "Public housing authorities",
  "11": "Other than public HEIs",
  "12": "Nonprofit organizations",
  "13": "Small businesses",
  "20": "Private institutions of higher education",
  "21": "Individuals",
  "22": "Education organizations",
  "23": "Food banks",
  "25": "Federally recognized tribes",
  "99": "Unrestricted",
};

// ---------------------------------------------------------------------------
// Date conversion: MMDDYYYY → YYYY-MM-DD
// ---------------------------------------------------------------------------
function parseGrantsGovDate(raw) {
  if (!raw || raw.length < 8) return "";
  const mm = raw.slice(0, 2);
  const dd = raw.slice(2, 4);
  const yyyy = raw.slice(4, 8);
  return `${yyyy}-${mm}-${dd}`;
}

// ---------------------------------------------------------------------------
// CFDA number(s) → industry tags array
// ---------------------------------------------------------------------------
function cfdaToTags(cfdaNumbers) {
  if (!cfdaNumbers) return ["General", "Federal"];
  const prefix = String(cfdaNumbers).split(".")[0].trim().padStart(2, "0");
  return CFDA_TAGS[prefix] ?? ["Federal", "General"];
}

// ---------------------------------------------------------------------------
// Eligibility codes (space-separated) → readable string
// ---------------------------------------------------------------------------
function parseEligibility(codes) {
  if (!codes) return "See official grant page for eligibility details.";
  return codes
    .trim()
    .split(/\s+/)
    .map((c) => ELIGIBILITY_LABELS[c] ?? c)
    .filter(Boolean)
    .join(", ");
}

// ---------------------------------------------------------------------------
// Extract text content between XML tags (simple, no full parser needed)
// We process the XML in chunks so this uses string scanning.
// ---------------------------------------------------------------------------
function extractTag(xml, tag) {
  const open = `<${tag}>`;
  const close = `</${tag}>`;
  const start = xml.indexOf(open);
  if (start === -1) return "";
  const end = xml.indexOf(close, start);
  if (end === -1) return "";
  return xml.slice(start + open.length, end).trim();
}

// ---------------------------------------------------------------------------
// Parse a single <OpportunitySynopsisDetail_1_0> XML block into a Grant
// ---------------------------------------------------------------------------
let grantIdCounter = 1;

function parseOpportunity(block) {
  const opportunityId = extractTag(block, "OpportunityID");
  const title = extractTag(block, "OpportunityTitle");
  const awardCeiling = extractTag(block, "AwardCeiling");
  const closeDate = extractTag(block, "CloseDate");
  const eligCodes = extractTag(block, "EligibleApplicants");
  const cfda = extractTag(block, "CFDANumbers");
  const agencyName = extractTag(block, "AgencyName");
  const description =
    extractTag(block, "Description") ||
    extractTag(block, "AdditionalInformationOnEligibility") ||
    `Grant opportunity from ${agencyName || "a federal agency"}.`;
  const oppNumber = extractTag(block, "OpportunityNumber");

  // Skip records missing critical fields
  if (!title || !opportunityId) return null;

  const fundingAmount = parseInt(awardCeiling, 10);
  if (!fundingAmount || fundingAmount <= 0) return null;

  const deadline = parseGrantsGovDate(closeDate);
  if (!deadline) return null;

  // Truncate description to reasonable length
  const cleanDescription = description
    .replace(/<[^>]*>/g, " ")   // strip any inner HTML tags
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 400);

  return {
    id: String(grantIdCounter++),
    title: title.slice(0, 120),
    funding_amount: fundingAmount,
    deadline,
    eligibility: parseEligibility(eligCodes),
    industry_tags: cfdaToTags(cfda),
    location: "National",                    // all Grants.gov entries are federal
    description: cleanDescription || `Federal grant opportunity: ${title}`,
    source_url: oppNumber
      ? `https://www.grants.gov/search-results-detail/${opportunityId}`
      : `https://www.grants.gov/search-results-detail/${opportunityId}`,
  };
}

// ---------------------------------------------------------------------------
// Core pipeline: fetch ZIP → decompress → parse XML → normalize → return grants
// ---------------------------------------------------------------------------
async function buildGrantsData() {
  // Step 1 — Find the current export URL from the Grants.gov listing page
  console.log("[1/5] Fetching Grants.gov export page...");
  const listingRes = await fetch("https://www.grants.gov/xml-extract.html", {
    headers: { "User-Agent": "GrantLocate-Bot/1.0 (grantlocate.com)" },
  });

  if (!listingRes.ok) {
    throw new Error(`Listing page returned ${listingRes.status}`);
  }

  const listingHtml = await listingRes.text();

  // Extract the ZIP href — looks like: GrantsDBExtract20250310v2.zip
  const zipMatch = listingHtml.match(/href="([^"]*GrantsDBExtract[^"]*\.zip)"/i);
  if (!zipMatch) throw new Error("Could not find ZIP link on Grants.gov listing page");

  const zipUrl = zipMatch[1].startsWith("http")
    ? zipMatch[1]
    : `https://www.grants.gov${zipMatch[1]}`;

  console.log(`[2/5] Downloading ZIP: ${zipUrl}`);

  // Step 2 — Download the ZIP
  const zipRes = await fetch(zipUrl, {
    headers: { "User-Agent": "GrantLocate-Bot/1.0 (grantlocate.com)" },
  });

  if (!zipRes.ok) throw new Error(`ZIP download returned ${zipRes.status}`);

  // Step 3 — Decompress (Workers support DecompressionStream natively)
  // The Grants.gov ZIP contains a single XML file.
  // We use a DEFLATE stream on the body directly after stripping the ZIP header.
  console.log("[3/5] Decompressing...");

  // Read raw ZIP bytes
  const zipBytes = new Uint8Array(await zipRes.arrayBuffer());

  // Parse ZIP local file header to find compressed data offset
  // ZIP local header: signature(4) + version(2) + flags(2) + compression(2) +
  //                   modtime(2) + moddate(2) + crc32(4) + compressed_size(4) +
  //                   uncompressed_size(4) + fname_len(2) + extra_len(2) = 30 bytes
  const fnameLen = zipBytes[26] | (zipBytes[27] << 8);
  const extraLen = zipBytes[28] | (zipBytes[29] << 8);
  const dataOffset = 30 + fnameLen + extraLen;

  const compressedData = zipBytes.slice(dataOffset);

  // Decompress using DecompressionStream with raw deflate
  const ds = new DecompressionStream("deflate-raw");
  const writer = ds.writable.getWriter();
  const reader = ds.readable.getReader();

  writer.write(compressedData);
  writer.close();

  // Collect decompressed chunks
  const chunks = [];
  let totalLength = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    totalLength += value.length;
  }

  // Combine all chunks into one buffer
  const xmlBytes = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    xmlBytes.set(chunk, offset);
    offset += chunk.length;
  }

  const xmlText = new TextDecoder("utf-8").decode(xmlBytes);

  // Step 4 — Parse XML
  console.log(`[4/5] Parsing XML (${Math.round(xmlText.length / 1024 / 1024)} MB)...`);

  grantIdCounter = 1;
  const grants = [];
  const tag = "OpportunitySynopsisDetail_1_0";
  const openTag = `<${tag}`;
  const closeTag = `</${tag}>`;

  let searchFrom = 0;
  while (true) {
    const start = xmlText.indexOf(openTag, searchFrom);
    if (start === -1) break;
    const end = xmlText.indexOf(closeTag, start);
    if (end === -1) break;

    const block = xmlText.slice(start, end + closeTag.length);
    const grant = parseOpportunity(block);
    if (grant) grants.push(grant);

    searchFrom = end + closeTag.length;
  }

  console.log(`[5/5] Parsed ${grants.length} valid grants`);
  return grants;
}

// ---------------------------------------------------------------------------
// Worker entry point
// ---------------------------------------------------------------------------
export default {
  // ── Cron trigger ──────────────────────────────────────────────────────────
  async scheduled(event, env, ctx) {
    ctx.waitUntil(
      (async () => {
        try {
          console.log("Cron triggered: starting grant refresh");
          const grants = await buildGrantsData();

          // Store in KV — split into chunks if needed (KV max value = 25 MB)
          // 10k grants JSON is typically ~8–12 MB, so one key is fine
          await env.GRANTS_KV.put("grants_data", JSON.stringify(grants));
          await env.GRANTS_KV.put("grants_count", String(grants.length));
          await env.GRANTS_KV.put("grants_last_updated", new Date().toISOString());

          console.log(`Stored ${grants.length} grants in KV`);
        } catch (err) {
          console.error("Cron job failed:", err.message);
        }
      })()
    );
  },

  // ── HTTP endpoints ────────────────────────────────────────────────────────
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    };

    // GET /grants — return paginated grants (supports ?page=N&pageSize=N)
    // Also reassembles chunked KV storage written by seed.mjs
    if (url.pathname === "/grants") {
      const PAGE_SIZE = parseInt(url.searchParams.get("pageSize") || "20", 10);
      const page      = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));

      // Load all grants from KV (chunked or single key)
      let allGrants = [];
      const chunksCount = await env.GRANTS_KV.get("grants_chunks");

      if (chunksCount) {
        // Chunked storage — fetch all in parallel and merge
        const total = parseInt(chunksCount, 10);
        const fetches = [];
        for (let i = 0; i < total; i++) {
          fetches.push(env.GRANTS_KV.get(`grants_data_${i}`));
        }
        const results = await Promise.all(fetches);
        for (const chunk of results) {
          if (chunk) allGrants.push(...JSON.parse(chunk));
        }
      } else {
        // Legacy single key
        const data = await env.GRANTS_KV.get("grants_data");
        if (!data) {
          return new Response(
            JSON.stringify({ error: "No data yet. Run seed.mjs to populate KV." }),
            { status: 404, headers: cors }
          );
        }
        allGrants = JSON.parse(data);
      }

      // Paginate
      const total      = allGrants.length;
      const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      const safePage   = Math.min(page, totalPages);
      const start      = (safePage - 1) * PAGE_SIZE;
      const pageGrants = allGrants.slice(start, start + PAGE_SIZE);

      return new Response(JSON.stringify({
        grants:     pageGrants,
        total,
        page:       safePage,
        totalPages,
        pageSize:   PAGE_SIZE,
      }), { headers: cors });
    }

    // GET /grants/:id — return a single grant by ID
    if (url.pathname.startsWith("/grants/") && url.pathname.split("/").length === 3) {
      const id = url.pathname.split("/")[2];

      // Load all chunks and find the grant
      let allGrants = [];
      const chunksCount = await env.GRANTS_KV.get("grants_chunks");

      if (chunksCount) {
        const total = parseInt(chunksCount, 10);
        const fetches = [];
        for (let i = 0; i < total; i++) {
          fetches.push(env.GRANTS_KV.get(`grants_data_${i}`));
        }
        const results = await Promise.all(fetches);
        for (const chunk of results) {
          if (chunk) allGrants.push(...JSON.parse(chunk));
        }
      } else {
        const data = await env.GRANTS_KV.get("grants_data");
        if (data) allGrants = JSON.parse(data);
      }

      const grant = allGrants.find(g => g.id === id);
      if (!grant) {
        return new Response(JSON.stringify({ error: "Grant not found" }), { status: 404, headers: cors });
      }
      return new Response(JSON.stringify(grant), { headers: cors });
    }

    // GET /status — check when data was last updated and how many grants
    if (url.pathname === "/status") {
      const count = await env.GRANTS_KV.get("grants_count");
      const updated = await env.GRANTS_KV.get("grants_last_updated");
      return new Response(
        JSON.stringify({ grants_count: count, last_updated: updated }),
        { headers: cors }
      );
    }

    // POST /refresh — manually trigger a data refresh (protect in production)
    if (url.pathname === "/refresh" && request.method === "POST") {
      const authHeader = request.headers.get("Authorization");
      if (authHeader !== `Bearer ${env.REFRESH_SECRET}`) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: cors,
        });
      }

      try {
        const grants = await buildGrantsData();
        await env.GRANTS_KV.put("grants_data", JSON.stringify(grants));
        await env.GRANTS_KV.put("grants_count", String(grants.length));
        await env.GRANTS_KV.put("grants_last_updated", new Date().toISOString());
        return new Response(
          JSON.stringify({ success: true, grants_stored: grants.length }),
          { headers: cors }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message }),
          { status: 500, headers: cors }
        );
      }
    }

    // Default
    return new Response(
      JSON.stringify({
        name: "GrantLocate Worker",
        endpoints: {
          "GET /grants": "Returns all grants as JSON",
          "GET /status": "Returns last update time and grant count",
          "POST /refresh": "Manually triggers a data refresh (requires Bearer token)",
        },
      }),
      { headers: cors }
    );
  },
};
