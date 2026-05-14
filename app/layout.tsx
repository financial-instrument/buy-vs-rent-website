import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { SITE_URL } from "@/lib/site";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import "./globals.css";

// Hardcoded as the default so the AdSense verification snippet ships on every
// page out of the box. Override via NEXT_PUBLIC_ADSENSE_CLIENT if needed.
const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "ca-pub-8574366979839175";
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;

const SITE_DESCRIPTION =
  "Compare renting and buying a home over your time horizon, with country-specific taxes (US, Netherlands, Italy) and full opportunity cost.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Rent vs Buy Calculator",
    template: "%s — Rent vs Buy",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Rent vs Buy",
    url: SITE_URL,
    title: {
      default: "Rent vs Buy Calculator",
      template: "%s — Rent vs Buy",
    },
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: "Rent vs Buy Calculator",
      template: "%s — Rent vs Buy",
    },
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="container flex-1 py-6">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-14 items-center justify-between gap-2">
        <Link href="/" className="font-semibold shrink-0">
          Rent vs Buy
        </Link>
        <nav className="flex items-center gap-2 text-sm sm:gap-4">
          <Link href="/us" className="hover:underline" aria-label="United States">
            <span className="sm:hidden">🇺🇸</span>
            <span className="hidden sm:inline">🇺🇸 US</span>
          </Link>
          <Link href="/nl" className="hover:underline" aria-label="Netherlands">
            <span className="sm:hidden">🇳🇱</span>
            <span className="hidden sm:inline">🇳🇱 NL</span>
          </Link>
          <Link href="/it" className="hover:underline" aria-label="Italy">
            <span className="sm:hidden">🇮🇹</span>
            <span className="hidden sm:inline">🇮🇹 IT</span>
          </Link>
          <Link
            href="/methodology"
            className="hidden text-muted-foreground hover:underline sm:inline"
          >
            Methodology
          </Link>
          <Link
            href="/about"
            className="hidden text-muted-foreground hover:underline sm:inline"
          >
            About
          </Link>
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          Educational tool. Not financial advice. Tax parameters reflect 2025 rules and may
          change.
        </span>
        <nav className="flex gap-4">
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
          <a href="mailto:financial-instruments@proton.me" className="hover:underline">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
