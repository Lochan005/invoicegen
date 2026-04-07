import "./globals.css";
import type { Metadata, Viewport } from "next";
import Link from "next/link";

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Quick Invoice PWA",
  description: "Mobile-first invoice generator with preview and PDF",
  applicationName: "Quick Invoice",
  appleWebApp: {
    capable: true,
    title: "Quick Invoice",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="container">
          <header className="topNav">
            <Link href="/create">Create</Link>
            <Link href="/preview">Preview</Link>
            <Link href="/saved">Saved</Link>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
