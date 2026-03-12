import Link from "next/link";
import { type Grant, PROGRAM_TYPE_LABELS } from "@/lib/grants";

function toSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface Props {
  grant: Grant;
}

export default function RelatedGrantLinks({ grant }: Props) {
  const stateSlug = toSlug(grant.location);
  const isNational = grant.location === "National";
  const programType = grant.programType ?? "grant";
  const programLabel = PROGRAM_TYPE_LABELS[programType];

  return (
    <div className="related-links">
      {/* More in same state */}
      {!isNational && (
        <div className="related-section">
          <p className="related-title">More grants in {grant.location}</p>
          <ul className="related-list">
            <li>
              <Link href={`/grants/state/${stateSlug}`} className="related-link">
                All {grant.location} grants
              </Link>
            </li>
            {grant.industry_tags.slice(0, 6).map((tag) => (
              <li key={tag}>
                <Link
                  href={`/grants/state/${stateSlug}/${toSlug(tag)}`}
                  className="related-link"
                >
                  {grant.location} · {tag}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* More in same industry */}
      <div className="related-section">
        <p className="related-title">Browse by industry</p>
        <ul className="related-list">
          {grant.industry_tags.map((tag) => (
            <li key={tag}>
              <Link href={`/grants/industry/${toSlug(tag)}`} className="related-link">
                {tag} grants
              </Link>
            </li>
          ))}
          {!isNational &&
            grant.industry_tags.slice(0, 4).map((tag) => (
              <li key={`state-${tag}`}>
                <Link
                  href={`/grants/state/${stateSlug}/${toSlug(tag)}`}
                  className="related-link"
                >
                  {tag} in {grant.location}
                </Link>
              </li>
            ))}
        </ul>
      </div>

      {/* Program type */}
      <div className="related-section">
        <p className="related-title">More {programLabel}</p>
        <ul className="related-list">
          <li>
            <Link href="/grants" className="related-link">
              All grants
            </Link>
          </li>
          <li>
            <Link href="/financial-help" className="related-link">
              Financial Help Programs
            </Link>
          </li>
          {!isNational && (
            <li>
              <Link href={`/grants/state/${stateSlug}`} className="related-link">
                All {grant.location} programs
              </Link>
            </li>
          )}
          <li>
            <Link href="/small-business-grants" className="related-link">
              Small Business Grants
            </Link>
          </li>
          <li>
            <Link href="/student-grants" className="related-link">
              Student Grants
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
