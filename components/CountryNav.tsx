"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { SHORT_KEYS } from "@/lib/url/encode";

// When the user switches country on a calculator page we want their shared
// inputs (home price, rent, equity split, etc.) to carry over. Country-specific
// keys (tax fields, NL Box 3, IT cadastral, …) stay behind because they don't
// map across jurisdictions; the next page falls back to country defaults for
// those.
function buildCommonQuery(searchParams: URLSearchParams): string {
  const out = new URLSearchParams();
  for (const [, short] of SHORT_KEYS.COMMON_KEYS) {
    const v = searchParams.get(short);
    if (v !== null) out.set(short, v);
  }
  const s = out.toString();
  return s ? `?${s}` : "";
}

export function CountryNav() {
  const path = usePathname();
  const searchParams = useSearchParams();
  const q = buildCommonQuery(new URLSearchParams(searchParams.toString()));

  const isCalc = path === "/us" || path === "/nl" || path === "/it";
  // Only carry params when we're on a calculator page; from /, /about, etc.
  // there are no inputs to forward.
  const suffix = isCalc ? q : "";

  return (
    <>
      <Link href={`/us${suffix}`} className="hover:underline" aria-label="United States">
        <span className="sm:hidden">🇺🇸</span>
        <span className="hidden sm:inline">🇺🇸 US</span>
      </Link>
      <Link href={`/nl${suffix}`} className="hover:underline" aria-label="Netherlands">
        <span className="sm:hidden">🇳🇱</span>
        <span className="hidden sm:inline">🇳🇱 NL</span>
      </Link>
      <Link href={`/it${suffix}`} className="hover:underline" aria-label="Italy">
        <span className="sm:hidden">🇮🇹</span>
        <span className="hidden sm:inline">🇮🇹 IT</span>
      </Link>
    </>
  );
}
