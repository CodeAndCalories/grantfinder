"use client";

export const dynamic = "force-dynamic";
export const runtime = "edge";

import { useState } from "react";
import { getAllGrants, formatCurrency } from "@/lib/grants";
import GrantCard from "@/components/GrantCard";

const STUDENT_TAGS = [
  "Education", "Research", "Science", "Technology", "Innovation",
  "Healthcare", "Workforce Development", "Environment", "Student",
  "Training", "Academic", "Scholarship", "Fellowship", "STEM",
  "University", "College",
];

const CHIPS: { label: string; icon: string; tags: string[] }[] = [
  { label: "All",                   icon: "🎓", tags: STUDENT_TAGS },
  { label: "Undergraduate",         icon: "📚", tags: ["Education"] },
  { label: "Graduate",              icon: "🔬", tags: ["Education", "Research", "Science"] },
  { label: "STEM",                  icon: "⚗️", tags: ["Science", "Technology", "Innovation", "Research"] },
  { label: "Research",              icon: "🧪", tags: ["Research", "Science"] },
  { label: "Minority Scholarships", icon: "🌟", tags: ["Education", "Community"] },
];

const CATEGORY_META: Record<string, string> = {
  Education: "🎓",
  Research: "🔬",
  Science: "⚗️",
  "Workforce Development": "💼",
};

const allStudentGrants = getAllGrants().filter((g) =>
  g.industry_tags.some((tag) =>
    STUDENT_TAGS.some((st) => st.toLowerCase() === tag.toLowerCase())
  )
);

const totalFunding = allStudentGrants.reduce((sum, g) => sum + g.funding_amount, 0);
const avgFunding = allStudentGrants.length > 0 ? Math.round(totalFunding / allStudentGrants.length) : 0;

const tagCounts: Record<string, number> = {};
for (const grant of allStudentGrants) {
  for (const tag of grant.industry_tags) {
    if (STUDENT_TAGS.some((st) => st.toLowerCase() === tag.toLowerCase())) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
}

export default function StudentGrantsPage() {
  const [activeChip, setActiveChip] = useState("All");

  const chip = CHIPS.find((c) => c.label === activeChip) ?? CHIPS[0];
  const visibleGrants = allStudentGrants.filter((g) =>
    g.industry_tags.some((tag) =>
      chip.tags.some((ct) => ct.toLowerCase() === tag.toLowerCase())
    )
  );

  return (
    <>
      {/* Hero */}
      <div className="student-hero">
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🎓</div>
        <h1 className="student-hero-title">Student &amp; College Grants</h1>
        <p className="student-hero-desc">
          Find government and education grants for college students, graduate students,
          and research programs. All grants are sourced from federal, state, and local programs.
        </p>
        <p className="student-hero-desc" style={{ marginBottom: "1.5rem" }}>
          Student grants help cover tuition, research funding, and academic programs across
          universities and colleges. Browse federal, state, and education grants available
          for undergraduate and graduate students throughout the United States.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {[
            { value: allStudentGrants.length, label: "Grants Available" },
            { value: formatCurrency(avgFunding), label: "Avg. Award" },
            { value: formatCurrency(totalFunding), label: "Total Funding" },
          ].map(({ value, label }) => (
            <div key={label} className="student-stat-pill">
              <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{value}</div>
              <div style={{ fontSize: "0.72rem", opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category chips */}
      <div className="student-chips">
        {CHIPS.map((c) => (
          <button
            key={c.label}
            className={`student-chip${activeChip === c.label ? " student-chip--active" : ""}`}
            onClick={() => setActiveChip(c.label)}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Tag breakdown strip */}
      {Object.keys(tagCounts).length > 0 && (
        <div className="student-tag-strip">
          {Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([tag, count]) => (
              <div key={tag} className="student-tag-pill">
                {CATEGORY_META[tag] ?? "📌"} {tag}
                <span className="student-tag-count">{count}</span>
              </div>
            ))}
        </div>
      )}

      {/* Results bar */}
      <div className="results-bar" style={{ marginBottom: "1rem" }}>
        <span className="results-count">
          {visibleGrants.length} {visibleGrants.length === 1 ? "grant" : "grants"} found
          {activeChip !== "All" && <> · <strong>{activeChip}</strong></>}
        </span>
      </div>

      {/* Grant cards */}
      {visibleGrants.length === 0 ? (
        <div className="empty-state">
          <h2>No grants found for this category</h2>
          <p>Try selecting a different chip or view All grants.</p>
        </div>
      ) : (
        <div className="grants-list">
          {visibleGrants.map((grant) => (
            <GrantCard key={grant.id} grant={grant} />
          ))}
        </div>
      )}
    </>
  );
}
