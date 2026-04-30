import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;

export const metadata: Metadata = {
  metadataBase: new URL("https://rentvsbuy.app"),
  title: {
    default: "Rent vs Buy Calculator",
    template: "%s — Rent vs Buy",
  },
  description:
    "Compare renting and buying a home over your time horizon, with country-specific taxes (US, Netherlands, Italy) and full opportunity cost.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {ADSENSE_CLIENT && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        {PLAUSIBLE_DOMAIN && (
          <Script
            defer
            data-domain={PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
        {GA4_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA4_ID}');
            `}</Script>
          </>
        )}
      </head>
      <body>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="container flex-1 py-6">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold">
          Rent vs Buy
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/us" className="hover:underline">🇺🇸 US</Link>
          <Link href="/nl" className="hover:underline">🇳🇱 NL</Link>
          <Link href="/it" className="hover:underline">🇮🇹 IT</Link>
          <Link href="/methodology" className="text-muted-foreground hover:underline">
            Methodology
          </Link>
          <Link href="/about" className="text-muted-foreground hover:underline">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container text-xs text-muted-foreground">
        Educational tool. Not financial advice. Tax parameters reflect 2025 rules and may
        change.
      </div>
    </footer>
  );
}
