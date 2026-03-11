# GrantLocate — Cloudflare Worker Setup Guide

## What this does

```
Cloudflare Worker (runs daily at 06:00 UTC)
        │
        ▼
Grants.gov XML export   ← free public download, ~30 MB ZIP
        │
        ▼
Decompress ZIP          ← built into Workers runtime, no libraries
        │
        ▼
Parse XML               ← scans ~10,000 grant blocks
        │
        ▼
Normalize to schema     ← maps CFDA codes → industry tags, dates, eligibility
        │
        ▼
Cloudflare KV           ← stores JSON array, globally replicated
        │
        ▼
Next.js fetches /grants ← your site reads live data, cached 24h
```

---

## Setup — step by step

### 1. Install Wrangler

```bash
cd grants-worker
npm install
```

### 2. Log in to Cloudflare

```bash
npx wrangler login
```

This opens a browser tab. Approve it. Free account is fine.

### 3. Create the KV namespace

```bash
npx wrangler kv:namespace create "GRANTS_KV"
```

Output will look like:
```
✅ Created namespace "GRANTS_KV"
Add the following to your wrangler.toml:
[[kv_namespaces]]
binding = "GRANTS_KV"
id = "abc123def456..."
```

Copy that `id` value into `wrangler.toml` replacing `REPLACE_WITH_YOUR_KV_NAMESPACE_ID`.

### 4. Set the refresh secret

This protects the `/refresh` endpoint so only you can trigger manual refreshes.

```bash
npx wrangler secret put REFRESH_SECRET
```

Enter any random string. To generate a good one:
```bash
openssl rand -hex 32
```

Save this value — you'll need it when calling `/refresh` from your Next.js app.

### 5. Deploy

```bash
npx wrangler deploy
```

Output:
```
✅ Deployed grants-worker to:
   https://grants-worker.YOUR-SUBDOMAIN.workers.dev
```

### 6. Trigger first data load manually

The cron runs at 6am UTC, but you can trigger it immediately:

```bash
curl -X POST https://grants-worker.YOUR-SUBDOMAIN.workers.dev/refresh \
  -H "Authorization: Bearer YOUR_REFRESH_SECRET"
```

This takes ~30–60 seconds while it downloads and parses the full XML.

### 7. Check it worked

```bash
curl https://grants-worker.YOUR-SUBDOMAIN.workers.dev/status
```

Response:
```json
{
  "grants_count": "9847",
  "last_updated": "2026-03-10T06:00:00.000Z"
}
```

### 8. Connect your Next.js app

Add to your Next.js `.env.local`:
```
GRANTS_WORKER_URL=https://grants-worker.YOUR-SUBDOMAIN.workers.dev
```

Add to your Vercel/hosting environment variables:
```
GRANTS_WORKER_URL=https://grants-worker.YOUR-SUBDOMAIN.workers.dev
```

---

## Updating your grants pages to use live data

Right now your pages use `getAllGrants()` from `lib/grants.ts` which reads the static JSON.
Switch to the live Worker by updating any Server Component:

**Before:**
```typescript
import { getAllGrants } from "@/lib/grants";
const grants = getAllGrants();
```

**After:**
```typescript
import { getLiveGrants } from "@/lib/fetchLiveGrants";
const grants = await getLiveGrants();
```

The `getLiveGrants()` function:
- Returns Worker data in production (when `GRANTS_WORKER_URL` is set)
- Automatically falls back to `data/grants.json` if the Worker is unreachable
- Caches the response for 24 hours via Next.js fetch cache

---

## Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/grants` | GET | Returns full grants JSON array |
| `/status` | GET | Returns grant count + last updated timestamp |
| `/refresh` | POST | Triggers manual data refresh (requires Bearer token) |

---

## Free tier limits

| Resource | Free limit | Your usage |
|---|---|---|
| Worker requests | 100,000/day | ~1/day (cron) + your traffic |
| Worker CPU time | 10ms/request | ~30s for parse (uses `waitUntil`, doesn't block) |
| KV reads | 100,000/day | 1 per page build or request |
| KV writes | 1,000/day | 1/day (the cron job) |
| KV storage | 1 GB | ~10 MB for 10k grants |

All within free tier. Cost: **$0**.

---

## Cron schedule

Current: `0 6 * * *` = every day at 06:00 UTC

To change it, edit `wrangler.toml`:
```toml
[triggers]
crons = ["0 6 * * *"]   # daily at 6am UTC
# crons = ["0 */12 * * *"]  # twice daily
# crons = ["0 6 * * 1"]    # weekly on Monday
```

Then redeploy: `npx wrangler deploy`

---

## Monitoring

Tail live Worker logs:
```bash
npx wrangler tail
```

View logs in Cloudflare Dashboard:
Workers & Pages → grants-worker → Logs

---

## File structure

```
grants-worker/
├── src/
│   └── index.js        ← the entire Worker (fetch + parse + store + serve)
├── wrangler.toml       ← Cloudflare config (cron, KV binding)
├── package.json
└── .gitignore

your-nextjs-app/
└── lib/
    └── fetchLiveGrants.ts   ← drop-in replacement for getAllGrants()
```
