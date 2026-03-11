"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/grants", label: "All Grants" },
  { href: "/student-grants", label: "Student Grants" },
  { href: "/saved", label: "⭐ Saved" },
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        display: "flex",
        gap: "0.25rem",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {NAV_LINKS.map(({ href, label }) => {
        const active = pathname === href || (href !== "/grants" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            style={{
              padding: "0.4rem 0.85rem",
              borderRadius: "0.375rem",
              fontSize: "0.9rem",
              fontWeight: active ? 600 : 400,
              textDecoration: "none",
              color: active ? "#2563eb" : "inherit",
              background: active ? "#eff6ff" : "transparent",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
