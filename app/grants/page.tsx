"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  getAllGrants,
  getUniqueIndustries,
  getUniqueLocations,
  filterAndSortGrants,
  formatCurrency,
  type SortOption,
} from "@/lib/grants";

const allGrants = getAllGrants();
const industries = getUniqueIndustries();
const locations = getUniqueLocations();

function deadlineClass(deadline: string): string {
  const today = new Date();
  const d = new Date(deadline);
  const days = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 14) return "deadline-urgent";
  if (days <= 45) return "deadline-soon";
  return "";
}

export default function GrantsPage() {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [minFunding, setMinFunding] = useState("");
  const [maxFunding, setMaxFunding] = useState("");
  const [deadlineBefore, setDeadlineBefore] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

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
      }),
    [search, industry, location, minFunding, maxFunding, deadlineBefore, sort]
  );

  function reset() {
    setSearch("");
    setIndustry("");
    setLocation("");
    setMinFunding("");
    setMaxFunding("");
    setDeadlineBefore("");
    setSort("newest");
  }

  return (
    <>
      <h1 className="page-title">Government Grants</h1>
      <p className="page-subtitle">Browse {allGrants.length} available grants</p>

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

        <button className="btn-reset" onClick={reset}>Reset</button>
      </div>

      {/* Results bar */}
      <div className="results-bar">
        <span className="results-count">
          {results.length} {results.length === 1 ? "grant" : "grants"} found
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
          {results.map((grant) => (
            <div className="grant-card" key={grant.id}>
              <div className="grant-card-header">
                <Link href={`/grants/${grant.id}`} className="grant-card-title">
                  {grant.title}
                </Link>
                <span className="grant-amount">
                  {formatCurrency(grant.funding_amount)}
                </span>
              </div>
              <div className="grant-meta">
                <span>📍 {grant.location}</span>
                <span className={deadlineClass(grant.deadline)}>
                  ⏰ Deadline: {new Date(grant.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <p className="grant-description">{grant.description}</p>
              <div className="tags">
                {grant.industry_tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
