/**
 * GrantLocate — Cloudflare Worker (CPU-limit safe version)
 *
 * THE PROBLEM WITH THE PREVIOUS VERSION:
 * HTTP requests on free Workers have a 10ms CPU limit.
 * Downloading + decompressing + parsing a 30MB ZIP took several seconds → Error 1102.
 *
 * THE FIX:
 * Heavy work ONLY runs inside the cron `scheduled()` handler,
 * which has a 15-MINUTE limit — plenty of time to parse 10k grants.
 *
 * The /refresh HTTP endpoint no longer tries to do heavy work.
 * Instead it gives you instructions to trigger the cron from the Dashboard.
 */

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

const ELIGIBILITY_LABELS = {
  "00": "State governments", "01": "County governments",
  "02": "City or township governments", "04": "Special district governments",
  "05": "Independent school districts",
  "06": "Public and state-controlled institutions of higher education",
  "07": "Native American tribal governments", "08": "Public housing authorities",
  "11": "Other than public HEIs", "12": "Nonprofit organizations",
  "13": "Small businesses", "20": "Private institutions of higher education",
  "21": "Individuals", "22": "Education organizations",
  "23": "Food banks", "25": "Federally recognized tribes", "99": "Unrestricted",
};

function parseGrantsGovDate(raw) {
  if (!raw || raw.length < 8) return "";
  return `${raw.slice(4, 8)}-${raw.slice(0, 2)}-${raw.slice(2, 4)}`;
}

function cfdaToTags(cfdaNumbers) {
  if (!cfdaNumbers) return ["General", "Federal"];
  const prefix = String(cfdaNumbers).split(".")[0].trim().padStart(2, "0");
  return CFDA_TAGS[prefix] ?? ["Federal", "General"];
}

function parseEligibility(codes) {
  if (!codes) return "See official grant page for eligibility details.";
  return codes.trim().split(/\s+/).map((c) => ELIGIBILITY_LABELS[c] ?? c).filter(Boolean).join(", ");
}

function extractTag(xml, tag) {
  const open = `<${tag}>`;
  const close = `</${tag}>`;
  const start = xml.indexOf(open);
  if (start === -1) return "";
  const end = xml.indexOf(close, start);
  if (end === -1) return "";
  return xml.slice(start + open.length, end).trim();
}

let grantIdCounter = 1;

function parseOpportunity(block) {
  const opportunityId = extractTag(block, "OpportunityID");
  const title         = extractTag(block, "OpportunityTitle");
  const awardCeiling  = extractTag(block, "AwardCeiling");
  const closeDate     = extractTag(block, "CloseDate");
  const eligCodes     = extractTag(block, "EligibleApplicants");
  const cfda          = extractTag(block, "CFDANumbers");
  const agencyName    = extractTag(block, "AgencyName");
  const description   =
    extractTag(block, "Description") ||
    extractTag(block, "AdditionalInformationOnEligibility") ||
    `Grant opportunity from ${agencyName || "a federal agency"}.`;

  if (!title || !opportunityId) return null;
  const fundingAmount = parseInt(awardCeiling, 10);
  if (!fundingAmount || fundingAmount <= 0) return null;
  const deadline = parseGrantsGovDate(closeDate);
  if (!deadline) return null;

  const cleanDescription = description
    .replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400);

  return {
    id: String(grantIdCounter++),
    title: title.slice(0, 120),
    funding_amount: fundingAmount,
    deadline,
    eligibility: parseEligibility(eligCodes),
    industry_tags: cfdaToTags(cfda),
    location: "National",
    description: cleanDescription || `Federal grant opportunity: ${title}`,
    source_url: `https://www.grants.gov/search-results-detail/${opportunityId}`,
  };
}

// ---------------------------------------------------------------------------
// Core pipeline — ONLY called from scheduled() which has a 15-minute limit
// HTTP requests have a 10ms CPU limit — this function must NEVER run there
// ---------------------------------------------------------------------------
async function buildGrantsData(env) {
  await env.GRANTS_KV.put("grants_status", "running");
  await env.GRANTS_KV.put("grants_status_updated", new Date().toISOString());

  console.log("[1/5] Fetching Grants.gov export page...");
  const listingRes = await fetch("https://www.grants.gov/xml-extract.html", {
    headers: { "User-Agent": "GrantLocate-Bot/1.0 (grantlocate.com)" },
  });
  if (!listingRes.ok) throw new Error(`Listing page returned ${listingRes.status}`);

  const listingHtml = await listingRes.text();
  const zipMatch = listingHtml.match(/href="([^"]*GrantsDBExtract[^"]*\.zip)"/i);
  if (!zipMatch) throw new Error("Could not find ZIP link on Grants.gov listing page");

  const zipUrl = zipMatch[1].startsWith("http")
    ? zipMatch[1]
    : `https://www.grants.gov${zipMatch[1]}`;

  // Strategy: try fetching the XML file directly first (avoids ZIP entirely).
  // Grants.gov hosts GrantsDBExtractXXXX.xml alongside the .zip — much simpler.
  // If that fails, fall back to the ZIP with robust header parsing.
  const xmlUrl = zipUrl.replace(/\.zip$/i, '.xml');
  console.log(`[2/5] Trying direct XML: ${xmlUrl}`);

  let xmlText = '';

  const xmlDirectRes = await fetch(xmlUrl, {
    headers: { 'User-Agent': 'GrantLocate-Bot/1.0 (grantlocate.com)' },
  });

  if (xmlDirectRes.ok) {
    console.log('[3/5] Got XML directly — skipping decompression');
    xmlText = await xmlDirectRes.text();
  } else {
    console.log(`[2b/5] Direct XML returned ${xmlDirectRes.status} — downloading ZIP...`);
    const zipRes = await fetch(zipUrl, {
      headers: { 'User-Agent': 'GrantLocate-Bot/1.0 (grantlocate.com)' },
    });
    if (!zipRes.ok) throw new Error(`ZIP download returned ${zipRes.status}`);

    console.log('[3/5] Reading ZIP bytes...');
    const zipBytes = new Uint8Array(await zipRes.arrayBuffer());

    // Parse local file header
    const fnameLen  = zipBytes[26] | (zipBytes[27] << 8);
    const extraLen  = zipBytes[28] | (zipBytes[29] << 8);
    const dataOffset = 30 + fnameLen + extraLen;

    // Find the ZIP64 compressed size from the extra field.
    // ZIP64 extra field id = 0x0001, layout:
    //   id(2) + size(2) + uncompressed_size(8) + compressed_size(8)
    // Standard fields 18-21 and 22-25 are 0xFFFFFFFF when ZIP64 is used.
    let compressedSize = 0;
    const extraStart = 30 + fnameLen;
    let pos = extraStart;
    while (pos < extraStart + extraLen - 3) {
      const fieldId   = zipBytes[pos]   | (zipBytes[pos+1] << 8);
      const fieldSize = zipBytes[pos+2] | (zipBytes[pos+3] << 8);
      if (fieldId === 0x0001 && fieldSize >= 16) {
        // uncompressed size: bytes pos+4 .. pos+11  (we skip it)
        // compressed size:   bytes pos+12 .. pos+19
        // JavaScript bitwise ops are 32-bit so read as two 32-bit halves
        const lo = (zipBytes[pos+12] | (zipBytes[pos+13] << 8) |
                    (zipBytes[pos+14] << 16) | (zipBytes[pos+15] << 24)) >>> 0;
        const hi = (zipBytes[pos+16] | (zipBytes[pos+17] << 8) |
                    (zipBytes[pos+18] << 16) | (zipBytes[pos+19] << 24)) >>> 0;
        // Files under 4GB: hi will be 0
        compressedSize = hi * 0x100000000 + lo;
        break;
      }
      pos += 4 + fieldSize;
    }

    // Fallback: if ZIP64 field not found, scan backwards for EOCD signature
    if (compressedSize === 0) {
      let eocdPos = zipBytes.length - 22;
      while (eocdPos > 0) {
        if (zipBytes[eocdPos]   === 0x50 && zipBytes[eocdPos+1] === 0x4B &&
            zipBytes[eocdPos+2] === 0x05 && zipBytes[eocdPos+3] === 0x06) {
          compressedSize = eocdPos - dataOffset;
          break;
        }
        eocdPos--;
      }
    }

    const sliceEnd = dataOffset + compressedSize;
    console.log(`   ZIP64 parse: offset=${dataOffset} compressedSize=${compressedSize} sliceEnd=${sliceEnd} totalBytes=${zipBytes.length}`);

    if (compressedSize <= 0 || sliceEnd > zipBytes.length) {
      throw new Error(`Bad ZIP layout: offset=${dataOffset} size=${compressedSize} total=${zipBytes.length}`);
    }

    // Stream compressed data through DecompressionStream in 1MB chunks.
    // We use 'deflate' (zlib-wrapped) first, fall back to 'deflate-raw'.
    // The trailing-bytes error is swallowed because by that point all real
    // data has already been decompressed and read successfully.
    const CHUNK = 1024 * 1024; // 1MB chunks

    async function decompress(format) {
      const ds     = new DecompressionStream(format);
      const writer = ds.writable.getWriter();
      const reader = ds.readable.getReader();

      // Write all chunks, swallow the trailing-bytes error on close
      const writePromise = (async () => {
        for (let i = dataOffset; i < sliceEnd; i += CHUNK) {
          const end = Math.min(i + CHUNK, sliceEnd);
          try { await writer.write(zipBytes.slice(i, end)); }
          catch (_) { break; }
        }
        try { await writer.close(); } catch (_) { /* trailing bytes — ignore */ }
      })();

      const chunks = [];
      let totalLen = 0;
      while (true) {
        try {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          totalLen += value.length;
        } catch (_) {
          break; // stream ended with trailing bytes — data already collected
        }
      }
      await writePromise.catch(() => {});

      if (totalLen === 0) throw new Error(`No data decompressed with ${format}`);
      const out = new Uint8Array(totalLen);
      let off = 0;
      for (const c of chunks) { out.set(c, off); off += c.length; }
      return new TextDecoder('utf-8').decode(out);
    }

    // Try deflate-raw (standard ZIP), then deflate (zlib-wrapped)
    try {
      console.log('   Trying deflate-raw...');
      xmlText = await decompress('deflate-raw');
    } catch (e1) {
      console.log(`   deflate-raw failed (${e1.message}), trying deflate...`);
      try {
        xmlText = await decompress('deflate');
      } catch (e2) {
        throw new Error(`Both deflate formats failed. deflate-raw: ${e1.message} | deflate: ${e2.message}`);
      }
    }
  }


  console.log(`[4/5] Parsing XML (${Math.round(xmlText.length / 1024 / 1024)} MB)...`);
  grantIdCounter = 1;
  const grants  = [];
  const openTag = "<OpportunitySynopsisDetail_1_0";
  const closeTag = "</OpportunitySynopsisDetail_1_0>";
  let from = 0;
  while (true) {
    const start = xmlText.indexOf(openTag, from);
    if (start === -1) break;
    const end = xmlText.indexOf(closeTag, start);
    if (end === -1) break;
    const grant = parseOpportunity(xmlText.slice(start, end + closeTag.length));
    if (grant) grants.push(grant);
    from = end + closeTag.length;
  }

  console.log(`[5/5] Storing ${grants.length} grants in KV...`);
  await env.GRANTS_KV.put("grants_data", JSON.stringify(grants));
  await env.GRANTS_KV.put("grants_count", String(grants.length));
  await env.GRANTS_KV.put("grants_last_updated", new Date().toISOString());
  await env.GRANTS_KV.put("grants_status", "ok");
  await env.GRANTS_KV.put("grants_status_updated", new Date().toISOString());
  console.log("Done.");
  return grants.length;
}

// ---------------------------------------------------------------------------
// Worker entry point
// ---------------------------------------------------------------------------
export default {

  // Daily refresh is handled by GitHub Actions running scripts/seed.mjs
  // which downloads, parses, and pushes grants directly to KV.

    // HTTP endpoints — lightweight only, no heavy processing
  async fetch(request, env) {
    const url  = new URL(request.url);
    const cors = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };

    // /status — shows last run info
    if (url.pathname === "/status") {
      const count   = await env.GRANTS_KV.get("grants_count");
      const updated = await env.GRANTS_KV.get("grants_last_updated");
      const status  = await env.GRANTS_KV.get("grants_status");
      return new Response(JSON.stringify({
        grants_count:    count   ?? "0 (no data yet)",
        last_updated:    updated ?? "never",
        pipeline_status: status  ?? "not run yet",
        tip: count
          ? "Data is ready. Fetch /grants to get the JSON."
          : "No data yet — trigger the cron from Cloudflare Dashboard → Workers → grants-worker → Triggers → Run.",
      }), { headers: cors });
    }

    // /grants — reassemble chunked grant data and return as one JSON array
    if (url.pathname === "/grants") {
      const chunksCount = await env.GRANTS_KV.get("grants_chunks");

      if (chunksCount) {
        // Chunked storage — fetch all in parallel and merge
        const total = parseInt(chunksCount, 10);
        const fetches = [];
        for (let i = 0; i < total; i++) {
          fetches.push(env.GRANTS_KV.get(`grants_data_${i}`));
        }
        const results = await Promise.all(fetches);
        const allGrants = [];
        for (const chunk of results) {
          if (chunk) allGrants.push(...JSON.parse(chunk));
        }
        return new Response(JSON.stringify(allGrants), { headers: cors });
      }

      // Legacy single-key fallback
      const data = await env.GRANTS_KV.get("grants_data");
      if (!data) {
        return new Response(JSON.stringify({
          error: "No grant data found. Run seed.mjs to populate KV.",
        }), { status: 404, headers: cors });
      }
      return new Response(data, { headers: cors });
    }

    // /refresh — explains how to trigger the cron (can't do heavy work in HTTP)
    if (url.pathname === "/refresh") {
      const status = await env.GRANTS_KV.get("grants_status");
      return new Response(JSON.stringify({
        note: "HTTP requests cannot run the full pipeline (Cloudflare 10ms CPU limit). Use the cron instead.",
        how_to_trigger_manually: [
          "Option A — Cloudflare Dashboard (easiest):",
          "  1. Go to https://dash.cloudflare.com",
          "  2. Workers & Pages → grants-worker → Triggers tab",
          "  3. Click Run next to the cron trigger",
          "  4. Wait ~60 seconds, then check /status",
          "",
          "Option B — Wrangler CLI:",
          "  npx wrangler dev --test-scheduled",
          "  then in another terminal: curl http://localhost:8787/__scheduled",
        ],
        current_status: status ?? "not run yet",
      }), { headers: cors });
    }

    // Default
    return new Response(JSON.stringify({
      name: "GrantLocate Worker",
      endpoints: {
        "GET /status":  "Check pipeline status, last run time, grant count",
        "GET /grants":  "Returns all grants as JSON (after cron has run)",
        "GET /refresh": "Instructions to manually trigger the data pipeline",
      },
    }), { headers: cors });
  },
};
