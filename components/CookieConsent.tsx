"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie_consent")) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
      <p className="cookie-text">
        We use cookies to improve your experience and serve relevant ads. By continuing to use
        GrantLocate, you agree to our use of cookies.{" "}
        <Link href="/privacy" className="cookie-link">Privacy Policy</Link>
      </p>
      <button className="cookie-accept" onClick={accept}>
        Accept
      </button>
    </div>
  );
}
