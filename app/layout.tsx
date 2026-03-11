import type { Metadata } from "next";
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
