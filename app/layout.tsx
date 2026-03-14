import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import SiteNav from "@/components/SiteNav";
import CookieConsent from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: "GrantLocate | Find Government Grants for Businesses and Nonprofits",
  description: "Government grants for businesses, nonprofits, research, and community projects",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7606786471448802"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>

      <body>
        <header>
          <div className="header-inner">
            <a href="/grants" className="logo">GrantLocate</a>
            <SiteNav />
          </div>
        </header>

        <main>{children}</main>

        <CookieConsent />

        <footer className="site-footer">
          <p className="footer-blurb">
            GrantLocate is a free directory helping businesses, nonprofits, students, and researchers discover 50,000+ government grants and funding opportunities across the United States.
          </p>
          <div className="footer-inner">
            <a href="/about">About</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms</a>
            <a href="/contact">Contact</a>
          </div>
        </footer>
      </body>
    </html>
  );
}