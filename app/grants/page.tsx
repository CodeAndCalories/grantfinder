"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  getAllGrants,
  getUniqueIndustries,
  getUniqueLocations,
  filterAndSortGrants,
  type SortOption,
  type ProgramType,
  PROGRAM_TYPE_LABELS,
} from "@/lib/grants";
import GrantCard from "@/components/GrantCard";

const allGrants = getAllGrants();
const industries = getUniqueIndustries();
const locations = getUniqueLocations();

const PAGE_SIZE = 20;

const PROGRAM_TYPE_OPTIONS: { value: ProgramType | ""; label: string }[] = [
  { value: "", label: "All program types" },
  { value: "grant", label: PROGRAM_TYPE_LABELS.grant },
  { value: "relief_fund", label: PROGRAM_TYPE_LABELS.relief_fund },
  { value: "assistance_program", label: PROGRAM_TYPE_LABELS.assistance_program },
  { value: "hardship_support", label: PROGRAM_TYPE_LABELS.hardship_support },
];

export default function GrantsPage() {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [minFunding, setMinFunding] = useState("");
  const [maxFunding, setMaxFunding] = useState("");
  const [deadlineBefore, setDeadlineBefore] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [programType, setProgramType] = useState<ProgramType | "">("");
  const [page, setPage] = useState(1);

  const results = useMemo(
    () =>
      filterAndSortGrants({
        search: search || undefined,
        industry: industry || undefined,
        location: location || undefined,
        minFunding: minFunding ? Number(minFunding) : undefined,
        maxFunding: maxFunding ? Number(maxFunding) : undefined,
        deadlineBefore: deadlineBefore || undefined,
        sort,
        programType: programType || undefined,
      }),
    [search, industry, location, minFunding, maxFunding, deadlineBefore, sort, programType]
  );

  // Reset to page 1 whenever filters/sort change
  useEffect(() => {
    setPage(1);
  }, [search, industry, location, minFunding, maxFunding, deadlineBefore, sort, programType]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paginatedResults = results.slice(start, start + PAGE_SIZE);

  function reset() {
    setSearch("");
    setIndustry("");
    setLocation("");
    setMinFunding("");
    setMaxFunding("");
    setDeadlineBefore("");
    setSort("newest");
    setProgramType("");
    setPage(1);
  }

  // Build a compact page number list: always show first, last, current ±2, with ellipsis
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
        Browse {allGrants.length}+ active grants and funding opportunities &nbsp;|&nbsp;{" "}
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

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by title, description, or eligibility…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>Industry</label>
          <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
            <option value="">All industries</option>
            {industries.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Location</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
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
            placeholder="e.g. 50000"
            value={minFunding}
            onChange={(e) => setMinFunding(e.target.value)}
            min={0}
          />
        </div>

        <div className="filter-group">
          <label>Max Funding ($)</label>
          <input
            type="number"
            placeholder="e.g. 500000"
            value={maxFunding}
            onChange={(e) => setMaxFunding(e.target.value)}
            min={0}
          />
        </div>

        <div className="filter-group">
          <label>Deadline Before</label>
          <input
            type="date"
            value={deadlineBefore}
            onChange={(e) => setDeadlineBefore(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Program Type</label>
          <select value={programType} onChange={(e) => setProgramType(e.target.value as ProgramType | "")}>
            {PROGRAM_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <button className="btn-reset" onClick={reset}>Reset</button>
      </div>

      {/* Results bar */}
      <div className="results-bar">
        <span className="results-count">
          {results.length === 0
            ? "0 grants found"
            : `Showing ${start + 1}–${Math.min(start + PAGE_SIZE, results.length)} of ${results.length} ${results.length === 1 ? "grant" : "grants"}`}
        </span>
        <select
          className="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
        >
          <option value="newest">Sort: Newest</option>
          <option value="deadline">Sort: Deadline Soon</option>
          <option value="highest_funding">Sort: Highest Funding</option>
        </select>
      </div>

      {/* Grant list */}
      {results.length === 0 ? (
        <div className="empty-state">
          <h2>No grants found</h2>
          <p>Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grants-list">
          {paginatedResults.map((grant) => (
            <GrantCard key={grant.id} grant={grant} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="pagination" aria-label="Pagination">
          <button
            className="pagination-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Previous
          </button>

          <div className="pagination-pages">
            {pageNumbers().map((n, i) =>
              n === "…" ? (
                <span key={`ellipsis-${i}`} className="pagination-ellipsis">…</span>
              ) : (
                <button
                  key={n}
                  className={`pagination-page${page === n ? " pagination-page--active" : ""}`}
                  onClick={() => setPage(n)}
                  aria-current={page === n ? "page" : undefined}
                >
                  {n}
                </button>
              )
            )}
          </div>

          <button
            className="pagination-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </nav>
      )}
    </>
  );
}
