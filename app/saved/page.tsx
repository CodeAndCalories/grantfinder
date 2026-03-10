"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getGrantById } from "@/lib/grants";
import { getSavedGrantIds } from "@/lib/savedGrants";
import GrantCard from "@/components/GrantCard";
import { type Grant } from "@/lib/grants";

export default function SavedGrantsPage() {
  const [savedGrants, setSavedGrants] = useState<Grant[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const ids = getSavedGrantIds();
    const grants = ids
      .map((id) => getGrantById(id))
      .filter((g): g is Grant => g !== undefined);
    setSavedGrants(grants);
    setLoaded(true);
  }, []);

  function handleUnsave(id: string) {
    setSavedGrants((prev) => prev.filter((g) => g.id !== id));
  }

  if (!loaded) {
    return (
      <>
        <h1 className="page-title">Saved Grants</h1>
        <p className="page-subtitle">Loading…</p>
      </>
    );
  }

  return (
    <>
      <h1 className="page-title">Saved Grants</h1>
      <p className="page-subtitle">
        {savedGrants.length} saved {savedGrants.length === 1 ? "grant" : "grants"}
      </p>

      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/grants" style={{ color: "inherit", opacity: 0.7, textDecoration: "none", fontSize: "0.9rem" }}>
          ← Back to all grants
        </Link>
      </div>

      {savedGrants.length === 0 ? (
        <div className="empty-state">
          <h2>No saved grants yet</h2>
          <p>
            Click the ☆ star on any grant to save it here.{" "}
            <Link href="/grants">Browse all grants →</Link>
          </p>
        </div>
      ) : (
        <div className="grants-list">
          {savedGrants.map((grant) => (
            <GrantCard key={grant.id} grant={grant} onUnsave={handleUnsave} />
          ))}
        </div>
      )}
    </>
  );
}
