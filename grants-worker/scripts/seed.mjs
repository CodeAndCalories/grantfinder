#!/usr/bin/env node
/**
 * seed.mjs — GrantLocate local seed script
 * Downloads Grants.gov ZIP, parses XML, pushes JSON to Cloudflare KV
 *
 * Usage:
 *   npm install adm-zip
 *   node scripts/seed.mjs
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TMP_ZIP  = path.join(__dirname, '..', 'tmp_grants.zip');
const TMP_XML  = path.join(__dirname, '..', 'tmp_grants.xml');
const TMP_JSON = path.join(__dirname, '..', 'tmp_grants.json');

// ---------------------------------------------------------------------------
// CFDA prefix → industry tags
// ---------------------------------------------------------------------------
const CFDA_TAGS = {
  '10': ['Agriculture', 'Rural Development', 'Food'],
  '11': ['Technology', 'Economic Development', 'Innovation'],
  '12': ['Defense', 'Research', 'Technology'],
  '14': ['Housing', 'Community', 'Economic Development'],
  '15': ['Environment', 'Rural Development', 'Natural Resources'],
  '16': ['Community', 'Nonprofit', 'Workforce Development'],
  '17': ['Workforce Development', 'Small Business', 'Economic Development'],
  '20': ['Transportation', 'Infrastructure', 'Community'],
  '21': ['Finance', 'Economic Development', 'Small Business'],
  '23': ['Community', 'Infrastructure', 'Economic Development'],
  '43': ['Research', 'Science', 'Aerospace'],
  '45': ['Arts', 'Culture', 'Nonprofit'],
  '47': ['Research', 'Science', 'Technology'],
  '59': ['Small Business', 'Entrepreneurship', 'Economic Development'],
  '64': ['Veterans', 'Healthcare', 'Education'],
  '66': ['Environment', 'Water', 'Community'],
  '81': ['Energy', 'Research', 'Science'],
  '84': ['Education', 'Workforce Development', 'Research'],
  '93': ['Healthcare', 'Research', 'Community'],
  '94': ['Community', 'Nonprofit', 'Education'],
  '97': ['Research', 'Technology', 'Innovation'],
};

const ELIGIBILITY_LABELS = {
  '00': 'State governments',
  '01': 'County governments',
  '02': 'City or township governments',
  '04': 'Special district governments',
  '05': 'Independent school districts',
  '06': 'Public and state-controlled institutions of higher education',
  '07': 'Native American tribal governments',
  '08': 'Public housing authorities',
  '11': 'Other than public HEIs',
  '12': 'Nonprofit organizations',
  '13': 'Small businesses',
  '20': 'Private institutions of higher education',
  '21': 'Individuals',
  '22': 'Education organizations',
  '23': 'Food banks',
  '25': 'Federally recognized tribes',
  '99': 'Unrestricted',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseDate(raw) {
  if (!raw || raw.length < 8) return '';
  return `${raw.slice(4, 8)}-${raw.slice(0, 2)}-${raw.slice(2, 4)}`;
}

function cfdaToTags(cfda) {
  if (!cfda) return ['General', 'Federal'];
  const prefix = String(cfda).split('.')[0].trim().padStart(2, '0');
  return CFDA_TAGS[prefix] ?? ['Federal', 'General'];
}

function parseEligibility(codes) {
  if (!codes) return 'See official grant page for eligibility details.';
  return codes.trim().split(/\s+/).map(c => ELIGIBILITY_LABELS[c] ?? c).filter(Boolean).join(', ');
}

function extractTag(xml, tag) {
  const open  = `<${tag}>`;
  const close = `</${tag}>`;
  const start = xml.indexOf(open);
  if (start === -1) return '';
  const end = xml.indexOf(close, start);
  if (end === -1) return '';
  return xml.slice(start + open.length, end).trim();
}

// ---------------------------------------------------------------------------
// HTTP GET with redirect following
// ---------------------------------------------------------------------------
function get(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'GrantLocate-Bot/1.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(get(res.headers.location));
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// Download file to disk with progress
// ---------------------------------------------------------------------------
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    let downloaded = 0;

    function request(url) {
      const client = url.startsWith('https') ? https : http;
      client.get(url, { headers: { 'User-Agent': 'GrantLocate-Bot/1.0' } }, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          console.log(`   Redirect → ${res.headers.location}`);
          return request(res.headers.location);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        const total = parseInt(res.headers['content-length'] || '0', 10);
        res.on('data', chunk => {
          downloaded += chunk.length;
          if (total > 0) {
            const pct = Math.round(downloaded / total * 100);
            process.stdout.write(`\r   ${pct}% — ${Math.round(downloaded/1024/1024)}MB / ${Math.round(total/1024/1024)}MB`);
          }
        });
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          process.stdout.write('\n');
          resolve();
        });
        file.on('error', reject);
      }).on('error', reject);
    }

    request(url);
  });
}

// ---------------------------------------------------------------------------
// Parse XML into grant objects
// ---------------------------------------------------------------------------
function parseXml(xmlPath) {
  console.log('\n[4/5] Parsing XML...');
  const xml = fs.readFileSync(xmlPath, 'utf8');
  console.log(`   Size: ${Math.round(xml.length / 1024 / 1024)}MB`);

  const grants   = [];
  const openTag  = '<OpportunitySynopsisDetail_1_0';
  const closeTag = '</OpportunitySynopsisDetail_1_0>';
  let from = 0;
  let id = 1;
  let skipped = 0;

  while (true) {
    const start = xml.indexOf(openTag, from);
    if (start === -1) break;
    const end = xml.indexOf(closeTag, start);
    if (end === -1) break;

    const block         = xml.slice(start, end + closeTag.length);
    const opportunityId = extractTag(block, 'OpportunityID');
    const title         = extractTag(block, 'OpportunityTitle');
    const awardCeiling  = extractTag(block, 'AwardCeiling');
    const awardFloor    = extractTag(block, 'AwardFloor');
    const closeDate     = extractTag(block, 'CloseDate');
    const eligCodes     = extractTag(block, 'EligibleApplicants');
    const cfda          = extractTag(block, 'CFDANumbers');
    const agencyName    = extractTag(block, 'AgencyName');
    const description   =
      extractTag(block, 'Description') ||
      extractTag(block, 'AdditionalInformationOnEligibility') ||
      `Grant opportunity from ${agencyName || 'a federal agency'}.`;

    from = end + closeTag.length;

    if (!title || !opportunityId) { skipped++; continue; }
    const fundingAmount = parseInt(awardCeiling, 10) || parseInt(awardFloor, 10) || 0;
    const deadline = parseDate(closeDate) || 'Rolling';
    // Skip only if BOTH funding amount and deadline are missing
    if (fundingAmount <= 0 && deadline === 'Rolling') { skipped++; continue; }

    const cleanDesc = description
      .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 400);

    grants.push({
      id:             String(id++),
      title:          title.slice(0, 120),
      funding_amount: fundingAmount,
      deadline,
      eligibility:    parseEligibility(eligCodes),
      industry_tags:  cfdaToTags(cfda),
      location:       'National',
      description:    cleanDesc || `Federal grant: ${title}`,
      source_url:     `https://www.grants.gov/search-results-detail/${opportunityId}`,
    });

    if (grants.length % 1000 === 0) {
      process.stdout.write(`\r   Parsed ${grants.length} grants...`);
    }
  }

  process.stdout.write('\n');
  console.log(`   ✅ ${grants.length} grants parsed, ${skipped} skipped`);
  return grants;
}

// ---------------------------------------------------------------------------
// Cleanup temp files
// ---------------------------------------------------------------------------
function cleanup() {
  for (const f of [TMP_ZIP, TMP_XML, TMP_JSON]) {
    try { fs.unlinkSync(f); } catch {}
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('='.repeat(55));
  console.log('  GrantLocate — Grants.gov Seed Script');
  console.log('='.repeat(55));

  try {
    // 1 — Find ZIP URL
    console.log('\n[1/5] Finding latest Grants.gov export...');
    const html = await get('https://www.grants.gov/xml-extract.html');
    const match = html.match(/href="([^"]*GrantsDBExtract[^"]*\.zip)"/i);
    if (!match) throw new Error('Could not find ZIP link on Grants.gov page');
    const zipUrl = match[1].startsWith('http') ? match[1] : `https://www.grants.gov${match[1]}`;
    console.log(`   URL: ${zipUrl}`);

    // 2 — Download ZIP
    console.log('\n[2/5] Downloading ZIP...');
    await downloadFile(zipUrl, TMP_ZIP);
    const zipSizeMB = Math.round(fs.statSync(TMP_ZIP).size / 1024 / 1024);
    console.log(`   Saved: ${zipSizeMB}MB`);

    // 3 — Extract XML
    console.log('\n[3/5] Extracting XML from ZIP...');
    const zip = new AdmZip(TMP_ZIP);
    const entries = zip.getEntries();
    const xmlEntry = entries.find(e => e.entryName.toLowerCase().endsWith('.xml'));
    if (!xmlEntry) throw new Error('No XML file found inside ZIP');
    console.log(`   Entry: ${xmlEntry.entryName}`);
    console.log(`   Uncompressed: ~${Math.round(xmlEntry.header.size / 1024 / 1024)}MB`);
    console.log('   Extracting... (this takes ~30 seconds)');
    const xmlData = xmlEntry.getData();
    fs.writeFileSync(TMP_XML, xmlData);
    console.log(`   ✅ Extracted`);

    // 4 — Parse XML
    const grants = parseXml(TMP_XML);

    // 5 — Push to KV in chunks (KV max value size = 25MB)
    console.log('\n[5/5] Pushing to Cloudflare KV...');
    const CHUNK_SIZE = 20000; // grants per chunk, ~15MB each
    const chunks = [];
    for (let i = 0; i < grants.length; i += CHUNK_SIZE) {
      chunks.push(grants.slice(i, i + CHUNK_SIZE));
    }
    console.log(`   Splitting ${grants.length} grants into ${chunks.length} chunks of ~${CHUNK_SIZE} each`);

    // Store each chunk under grants_data_0, grants_data_1, etc.
    for (let i = 0; i < chunks.length; i++) {
      const chunkPath = TMP_JSON.replace('.json', `_${i}.json`);
      fs.writeFileSync(chunkPath, JSON.stringify(chunks[i]));
      const sizeMB = Math.round(fs.statSync(chunkPath).size / 1024 / 1024);
      console.log(`   Chunk ${i}: ${chunks[i].length} grants (${sizeMB}MB)`);
      execSync(`npx wrangler kv key put --binding=GRANTS_KV "grants_data_${i}" --path="${chunkPath}"`, { stdio: 'inherit' });
      fs.unlinkSync(chunkPath);
    }

    // Store metadata
    execSync(`npx wrangler kv key put --binding=GRANTS_KV "grants_count" "${grants.length}"`, { stdio: 'inherit' });
    execSync(`npx wrangler kv key put --binding=GRANTS_KV "grants_chunks" "${chunks.length}"`, { stdio: 'inherit' });
    execSync(`npx wrangler kv key put --binding=GRANTS_KV "grants_last_updated" "${new Date().toISOString()}"`, { stdio: 'inherit' });
    execSync(`npx wrangler kv key put --binding=GRANTS_KV "grants_status" "ok"`, { stdio: 'inherit' });

    console.log('\n' + '='.repeat(55));
    console.log(`  ✅ Done! ${grants.length} grants stored in ${chunks.length} KV chunks`);
    console.log('  Check: https://grants-worker.axigamingclips.workers.dev/status');
    console.log('='.repeat(55) + '\n');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  } finally {
    cleanup();
  }
}

main();
