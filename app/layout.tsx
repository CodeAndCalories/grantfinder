import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrantFinder",
  description: "Search government grants",
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
            <a href="/grants" className="logo">GrantFinder</a>
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
