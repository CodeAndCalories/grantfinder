import type { Metadata } from "next";
import { getAllGrants, formatCurrency } from "@/lib/grants";
import GrantCard from "@/components/GrantCard";

export const metadata: Metadata = {
  title: "Student Grants | GrantLocate",
  description:
    "Find government and education grants for college students, graduate students, and research programs.",
};

const STUDENT_TAGS = ["Education", "Student", "Research", "Science", "Workforce Development"];

const CATEGORY_DESCRIPTIONS: Record<string, { icon: string; label: string; description: string }> = {
  Education: {
    icon: "🎓",
    label: "Education",
    description: "Grants for schools, universities, and learners at every level.",
  },
  Research: {
    icon: "🔬",
    label: "Research",
    description: "Funding for academic research projects and lab studies.",
  },
  Science: {
    icon: "⚗️",
    label: "Science",
    description: "STEM-focused grants supporting scientific discovery.",
  },
  "Workforce Development": {
    icon: "💼",
    label: "Workforce Development",
    description: "Grants to build skills and connect students to careers.",
  },
};

export default function StudentGrantsPage() {
  const allGrants = getAllGrants();

  // Match any grant whose industry_tags overlap with STUDENT_TAGS (case-insensitive)
  const studentGrants = allGrants.filter((g) =>
    g.industry_tags.some((tag) =>
      STUDENT_TAGS.some((st) => st.toLowerCase() === tag.toLowerCase())
    )
  );

  const totalFunding = studentGrants.reduce((sum, g) => sum + g.funding_amount, 0);
  const avgFunding = studentGrants.length > 0 ? Math.round(totalFunding / studentGrants.length) : 0;

  // Group by primary matching tag for the breakdown strip
  const tagCounts: Record<string, number> = {};
  for (const grant of studentGrants) {
    for (const tag of grant.industry_tags) {
      if (STUDENT_TAGS.some((st) => st.toLowerCase() === tag.toLowerCase())) {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      }
    }
  }

  return (
    <>
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
          borderRadius: "1rem",
          padding: "2.5rem 2rem",
          marginBottom: "2rem",
          color: "#fff",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🎓</div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 0.75rem" }}>
          Student &amp; Education Grants
        </h1>
        <p style={{ maxWidth: "600px", opacity: 0.9, margin: "0 0 1.5rem", lineHeight: 1.6 }}>
          Find government and education grants for college students, graduate students, and research
          programs. All grants are sourced from federal, state, and local programs.
        </p>

        {/* Stat pills */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {[
            { value: studentGrants.length, label: "Grants Available" },
            { value: formatCurrency(avgFunding), label: "Avg. Award" },
            { value: formatCurrency(totalFunding), label: "Total Funding" },
          ].map(({ value, label }) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(4px)",
                borderRadius: "0.5rem",
                padding: "0.6rem 1.1rem",
              }}
            >
              <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{value}</div>
              <div style={{ fontSize: "0.72rem", opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tag breakdown strip */}
      {Object.keys(tagCounts).length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            marginBottom: "1.75rem",
          }}
        >
          {Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([tag, count]) => {
              const meta = CATEGORY_DESCRIPTIONS[tag];
              return (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.4rem 0.85rem",
                    borderRadius: "999px",
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    fontSize: "0.82rem",
                    color: "#1d4ed8",
                    fontWeight: 500,
                  }}
                >
                  {meta?.icon ?? "📌"} {tag}
                  <span
                    style={{
                      background: "#2563eb",
                      color: "#fff",
                      borderRadius: "999px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "0 0.4rem",
                      lineHeight: "1.4",
                    }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
        </div>
      )}

      {/* Results count */}
      <div className="results-bar" style={{ marginBottom: "1rem" }}>
        <span className="results-count">
          {studentGrants.length} {studentGrants.length === 1 ? "grant" : "grants"} found
        </span>
      </div>

      {/* Grant cards */}
      {studentGrants.length === 0 ? (
        <div className="empty-state">
          <h2>No student grants found</h2>
          <p>Check back soon — new grants are added regularly.</p>
        </div>
      ) : (
        <div className="grants-list">
          {studentGrants.map((grant) => (
            <GrantCard key={grant.id} grant={grant} />
          ))}
        </div>
      )}
    </>
  );
}
