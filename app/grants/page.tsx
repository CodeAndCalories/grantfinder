export const revalidate = 3600;

import Link from "next/link";
import {
  getUniqueIndustries,
  getUniqueLocations,
  type ProgramType,
  PROGRAM_TYPE_LABELS,
} from "@/lib/grants";
import { getLiveGrantsPage } from "@/lib/fetchLiveGrants";
import GrantCard from "@/components/GrantCard";

const PROGRAM_TYPE_OPTIONS: { value: ProgramType | ""; label: string }[] = [
  { value: "", label: "All program types" },
  { value: "grant", label: PROGRAM_TYPE_LABELS.grant },
  { value: "relief_fund", label: PROGRAM_TYPE_LABELS.relief_fund },
  { value: "assistance_program", label: PROGRAM_TYPE_LABELS.assistance_program },
  { value: "hardship_support", label: PROGRAM_TYPE_LABELS.hardship_support },
];

const industries = getUniqueIndustries();
const locations = getUniqueLocations();

interface Props {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function GrantsPage({ searchParams }: Props) {
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const { grants, total, totalPages } = await getLiveGrantsPage(page);

  const start = (page - 1) * 20;

  // Build pagination page numbers with ellipsis
  function pageNumbers(): (number | "…")[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const nums = new Set<number>([1, totalPages]);
    for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) nums.add(i);
    const sorted = Array.from(nums).sort((a, b) => a - b);
    const result: (number | "…")[] = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("…");
      result.push(sorted[i]);
    }
    return result;
  }

  return (
    <>
      <h1 className="page-title">Government Grants</h1>
      <p className="page-subtitle">
        Browse 50,000+ active grants and funding opportunities &nbsp;|&nbsp;{" "}
        <Link href="/saved">⭐ View Saved Grants</Link>
      </p>

      {/* Financial Help banner */}
      <div className="fh-banner">
        <span>
          <strong>GrantLocate</strong> now helps you discover Grants, Relief Funds, Assistance Programs, and Hardship Support.
        </span>
        <Link href="/financial-help" className="fh-banner-link">
          Explore Financial Help →
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" action="/grants" className="filters" style={{ alignItems: "flex-end" }}>
        <div className="search-bar" style={{ marginBottom: 0 }}>
          <input
            type="text"
            name="search"
            placeholder="Search by title, description, or eligibility…"
            defaultValue={searchParams?.search as string | undefined}
          />
        </div>

        <div className="filter-group">
          <label>Industry</label>
          <select name="industry" defaultValue={searchParams?.industry as string | undefined}>
            <option value="">All industries</option>
            {industries.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Location</label>
          <select name="location" defaultValue={searchParams?.location as string | undefined}>
            <option value="">All locations</option>
            {locations.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Min Funding ($)</label>
          <input
            type="number"
            name="minFunding"
            placeholder="e.g. 50000"
            defaultValue={searchParams?.minFunding as string | undefined}
            min={0}
          />
        </div>

        <div className="filter-group">
          <label>Max Funding ($)</label>
          <input
            type="number"
            name="maxFunding"
            placeholder="e.g. 500000"
            defaultValue={searchParams?.maxFunding as string | undefined}
            min={0}
          />
        </div>

        <div className="filter-group">
          <label>Deadline Before</label>
          <input
            type="date"
            name="deadlineBefore"
            defaultValue={searchParams?.deadlineBefore as string | undefined}
          />
        </div>

        <div className="filter-group">
          <label>Program Type</label>
          <select name="programType" defaultValue={searchParams?.programType as string | undefined}>
            {PROGRAM_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn-reset">Search</button>
        <Link href="/grants" className="btn-reset" style={{ textAlign: "center" }}>Reset</Link>
      </form>

      {/* Results bar */}
      <div className="results-bar">
        <span className="results-count">
          {total === 0
            ? "0 grants found"
            : `Showing ${start + 1}–${Math.min(start + 20, total)} of ${total} grants`}
        </span>
        <form method="GET" action="/grants" style={{ display: "inline" }}>
          <select
            name="sort"
            className="sort-select"
            defaultValue={searchParams?.sort as string | undefined}
            onChange={undefined}
          >
            <option value="newest">Sort: Newest</option>
            <option value="deadline">Sort: Deadline Soon</option>
            <option value="highest_funding">Sort: Highest Funding</option>
          </select>
        </form>
      </div>

      {/* Grant list */}
      {grants.length === 0 ? (
        <div className="empty-state">
          <h2>No grants found</h2>
          <p>Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grants-list">
          {grants.map((grant) => (
            <GrantCard key={grant.id} grant={grant} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="pagination" aria-label="Pagination">
          <Link
            href={`/grants?page=${Math.max(1, page - 1)}`}
            className={`pagination-btn${page === 1 ? " pagination-btn--disabled" : ""}`}
            aria-disabled={page === 1}
          >
            ← Previous
          </Link>

          <div className="pagination-pages">
            {pageNumbers().map((n, i) =>
              n === "…" ? (
                <span key={`ellipsis-${i}`} className="pagination-ellipsis">…</span>
              ) : (
                <Link
                  key={n}
                  href={`/grants?page=${n}`}
                  className={`pagination-page${page === n ? " pagination-page--active" : ""}`}
                  aria-current={page === n ? "page" : undefined}
                >
                  {n}
                </Link>
              )
            )}
          </div>

          <Link
            href={`/grants?page=${Math.min(totalPages, page + 1)}`}
            className={`pagination-btn${page === totalPages ? " pagination-btn--disabled" : ""}`}
            aria-disabled={page === totalPages}
          >
            Next →
          </Link>
        </nav>
      )}
    </>
  );
}
