"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type Grant, formatCurrency } from "@/lib/grants";
import { isGrantSaved, toggleSavedGrant } from "@/lib/savedGrants";

function deadlineClass(deadline: string): string {
  const today = new Date();
  const d = new Date(deadline);
  const days = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 14) return "deadline-urgent";
  if (days <= 45) return "deadline-soon";
  return "";
}

interface GrantCardProps {
  grant: Grant;
  onUnsave?: (id: string) => void; // optional: called after unsaving (for saved page)
}

export default function GrantCard({ grant, onUnsave }: GrantCardProps) {
  const [saved, setSaved] = useState(false);

  // Read from localStorage only on the client
  useEffect(() => {
    setSaved(isGrantSaved(grant.id));
  }, [grant.id]);

  function handleStar(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggleSavedGrant(grant.id);
    setSaved(nowSaved);
    if (!nowSaved && onUnsave) onUnsave(grant.id);
  }

  return (
    <div className="grant-card" style={{ position: "relative" }}>
      {/* Star button */}
      <button
        onClick={handleStar}
        aria-label={saved ? "Remove from saved" : "Save grant"}
        title={saved ? "Remove from saved" : "Save grant"}
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "1.4rem",
          lineHeight: 1,
          padding: "0",
          color: saved ? "#f59e0b" : "#d1d5db",
          transition: "color 0.15s",
        }}
      >
        {saved ? "★" : "☆"}
      </button>

      <div className="grant-card-header" style={{ paddingRight: "2.5rem" }}>
        <Link href={`/grants/${grant.id}`} className="grant-card-title">
          {grant.title}
        </Link>
        <span className="grant-amount">{formatCurrency(grant.funding_amount)}</span>
      </div>

      <div className="grant-meta">
        <span>📍 {grant.location}</span>
        <span className={deadlineClass(grant.deadline)}>
          ⏰ Deadline:{" "}
          {new Date(grant.deadline).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      <p className="grant-description">{grant.description}</p>

      <div className="tags">
        {grant.industry_tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
