import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import SiteNav from "@/components/SiteNav";

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
      </body>
    </html>
  );
}