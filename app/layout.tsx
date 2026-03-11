import type { Metadata } from "next";
import "./globals.css";

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
            <nav>
              <a href="/grants">Browse Grants</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
