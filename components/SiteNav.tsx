"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "/grants",        label: "All Grants" },
  { href: "/financial-help", label: "Financial Help" },
  { href: "/student-grants", label: "Student Grants" },
  { href: "/guides",        label: "Funding Guides" },
  { href: "/saved",         label: "⭐ Saved" },
];

const MOBILE_EXTRA = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/contact", label: "Contact" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  function isActive(href: string) {
    return pathname === href || (href !== "/grants" && pathname.startsWith(href));
  }

  return (
    <>
      {/* Desktop nav */}
      <nav className="sitenav-desktop">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`sitenav-link${isActive(href) ? " sitenav-link--active" : ""}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Dark mode toggle */}
      <button
        className="sitenav-darkmode"
        onClick={toggleDark}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        title={dark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {dark ? "☀️" : "🌙"}
      </button>

      {/* Mobile hamburger button */}
      <button
        className="sitenav-hamburger"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`sitenav-bar${open ? " sitenav-bar--open-1" : ""}`} />
        <span className={`sitenav-bar${open ? " sitenav-bar--open-2" : ""}`} />
        <span className={`sitenav-bar${open ? " sitenav-bar--open-3" : ""}`} />
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="sitenav-mobile" onClick={() => setOpen(false)}>
          {[...NAV_LINKS, ...MOBILE_EXTRA].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`sitenav-mobile-link${isActive(href) ? " sitenav-mobile-link--active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
