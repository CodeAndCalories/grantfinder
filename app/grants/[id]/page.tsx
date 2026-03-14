import { notFound } from "next/navigation";
import Link from "next/link";
import { getGrantById, formatCurrency, type Grant } from "@/lib/grants";

function toSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const dynamic = "force-dynamic";
export const runtime = "edge";

async function fetchGrant(id: string): Promise<Grant | undefined> {
  const workerUrl = process.env.GRANTS_WORKER_URL;
  if (workerUrl) {
    try {
      const res = await fetch(`${workerUrl}/grants/${id}`, { cache: "no-store" });
      if (res.ok) return res.json();
    } catch {}
  }
  // Fallback to static JSON
  return getGrantById(id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const grant = await fetchGrant(id);
  if (!grant) return { title: "Grant Not Found" };
  return { title: `${grant.title} — GrantLocate` };
}

function deadlineBadge(deadline: string) {
  const today = new Date();
  const d = new Date(deadline);
  const days = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const formatted = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  if (days <= 14) return <span className="value deadline-urgent">{formatted} ({days}d left!)</span>;
  if (days <= 45) return <span className="value deadline-soon">{formatted} ({days}d left)</span>;
  return <span className="value">{formatted}</span>;
}

export default async function GrantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const grant = await fetchGrant(id);
  if (!grant) notFound();

  return (
    <>
      <Link href="/grants" className="detail-back">
        ← Back to all grants
      </Link>

      <div className="detail-card">
        <div className="detail-header">
          <h1 className="detail-title">{grant.title}</h1>
          <div className="detail-stats">
            <div className="detail-stat">
              <label>Funding Amount</label>
              <span className="value amount">{formatCurrency(grant.funding_amount)}</span>
            </div>
            <div className="detail-stat">
              <label>Deadline</label>
              {deadlineBadge(grant.deadline)}
            </div>
            <div className="detail-stat">
              <label>Location</label>
              <span className="value">{grant.location}</span>
            </div>
          </div>
        </div>

        <div className="detail-body">
          <div className="detail-section">
            <h3>Description</h3>
            <p>{grant.description}</p>
          </div>

          <div className="detail-section">
            <h3>Eligibility</h3>
            <p>{grant.eligibility}</p>
          </div>

          <div className="detail-section">
            <h3>Industry Tags</h3>
            <div className="tags">
              {grant.industry_tags.map((tag) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <h3>Apply</h3>
            <a
              href={grant.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              View Official Grant Page ↗
            </a>
          </div>
        </div>
      </div>

      {/* More grants links */}
      <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>Related Grants</h2>
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {grant.industry_tags[0] && (
            <li>
              <Link
                href={`/grants/${toSlug(grant.industry_tags[0])}`}
                style={{ color: "var(--primary)", fontWeight: 500 }}
              >
                More {grant.industry_tags[0]} grants →
              </Link>
            </li>
          )}
          <li>
            <Link
              href={`/grants?search=${encodeURIComponent(grant.title.split(" ")[0])}`}
              style={{ color: "var(--primary)", fontWeight: 500 }}
            >
              More grants like this →
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
